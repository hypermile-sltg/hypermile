import { NextResponse } from 'next/server'
import { CHATBOT_SYSTEM_INSTRUCTION } from '@/lib/chatbot-prompt'

export const runtime = 'nodejs'
export const maxDuration = 60

// Hemat + Free Tier (sumber: https://ai.google.dev/gemini-api/docs/pricing)
// 2.5 Flash-Lite = paling murah paid; 2.5 Flash = free stabil + multimodal;
// 3.1 Flash-Lite = free + murah di gen-3; hindari 3.5 Flash (paid mahal).
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
].filter((m, i, arr) => m !== PRIMARY_MODEL && arr.indexOf(m) === i)
const MAX_HISTORY = 8

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

type Socials = {
  instagram?: string
  tiktok?: string
  youtube?: string
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildContents(messages: ChatMessage[]) {
  const recent = messages.slice(-MAX_HISTORY)

  return recent.map((msg) => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []

    if (msg.image?.startsWith('data:')) {
      try {
        const [meta, data] = msg.image.split(',')
        const mimeType = meta.split(';')[0]?.split(':')[1] || 'image/jpeg'
        if (data) {
          parts.push({ inlineData: { mimeType, data } })
        }
      } catch {
        // skip invalid image
      }
    }

    parts.push({ text: msg.content || (msg.image ? 'Analisis kerusakan di foto ini.' : '') })

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })
}

function extractText(data: any): { text: string; finishReason?: string } {
  const candidate = data?.candidates?.[0]
  const finishReason = candidate?.finishReason as string | undefined
  const text =
    candidate?.content?.parts
      ?.filter((part: any) => typeof part.text === 'string' && !part.thought)
      ?.map((part: any) => part.text)
      .join('')
      ?.trim() || ''

  return { text, finishReason }
}

function buildRequestBody(
  messages: ChatMessage[],
  systemText: string,
  thinking: 'level' | 'budget' | 'none'
) {
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: 4096,
  }

  if (thinking === 'level') {
    generationConfig.thinkingConfig = { thinkingLevel: 'minimal' }
  } else if (thinking === 'budget') {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }

  return {
    contents: buildContents(messages),
    systemInstruction: {
      parts: [{ text: systemText }],
    },
    generationConfig,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
}

async function callGeminiOnce(
  model: string,
  body: Record<string, unknown>,
  apiKey: string
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (response.status === 429) {
    return { ok: false as const, status: 429, error: 'RATE_LIMIT' as const, data }
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      (response.status === 503
        ? 'Model AI sedang sibuk. Coba lagi sebentar.'
        : 'Gagal mendapatkan respon dari AI.')
    return { ok: false as const, status: response.status, error: message, data }
  }

  return { ok: true as const, data, model }
}

async function callGeminiWithFallback(
  messages: ChatMessage[],
  systemText: string,
  apiKey: string
) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS]
  let lastError: { status: number; error: string } | null = null

  for (const model of models) {
    // Coba thinking minimal dulu, lalu budget 0, lalu tanpa thinkingConfig
    for (const thinking of ['level', 'budget', 'none'] as const) {
      // Skip thinkingLevel pada model yang lebih cocok pakai budget/none
      if (thinking === 'level' && (model.includes('2.5') || model.includes('flash-lite'))) continue

      const body = buildRequestBody(messages, systemText, thinking)
      const result = await callGeminiOnce(model, body, apiKey)

      if (result.ok) return result

      lastError = { status: result.status, error: String(result.error) }

      // 429: jeda sebentar, lanjut model berikutnya (jangan spam retry model yang sama)
      if (result.status === 429) {
        await sleep(1500)
        break
      }

      // Model tidak tersedia → langsung model berikutnya
      if (
        result.status === 404 ||
        /no longer available|not found|is not found/i.test(String(result.error))
      ) {
        break
      }

      // Config thinking tidak valid → coba mode thinking berikutnya
      if (/thinking|invalid.?argument/i.test(String(result.error))) {
        continue
      }

      // Error lain → coba model berikutnya
      break
    }
  }

  return {
    ok: false as const,
    status: lastError?.status || 500,
    error: lastError?.error || 'Gagal mendapatkan respon dari AI.',
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error('Chat API: GEMINI_API_KEY missing')
      return NextResponse.json(
        { error: 'Maaf, asisten sedang tidak tersedia. Silakan coba lagi nanti atau hubungi admin via WhatsApp.' },
        { status: 500 }
      )
    }

    const payload = await req.json()
    const messages = Array.isArray(payload?.messages) ? (payload.messages as ChatMessage[]) : []
    const socials = (payload?.socials || {}) as Socials

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Pesan kosong.' }, { status: 400 })
    }

    const systemText = `${CHATBOT_SYSTEM_INSTRUCTION}

TAUTAN SOSIAL MEDIA RESMI HYPERMILE AUTO BODYWORKS:
- Instagram: ${socials.instagram || 'https://www.instagram.com/hypermile_salatiga'}
- TikTok: ${socials.tiktok || 'https://www.tiktok.com/@hypermileofficial'}
- YouTube: ${socials.youtube || 'https://www.youtube.com/@hypermileautobodyworks'}
(Gunakan tautan di atas jika pelanggan bertanya tentang Instagram, TikTok, YouTube, atau media sosial kami).`

    const result = await callGeminiWithFallback(messages, systemText, apiKey)

    if (!result.ok) {
      console.error('Chat API upstream error:', result.status, result.error)

      if (result.error === 'RATE_LIMIT' || result.status === 429) {
        return NextResponse.json(
          {
            error:
              'Maaf, asisten sedang ramai. Mohon tunggu sebentar lalu coba lagi, atau hubungi admin via WhatsApp.',
            code: 'RATE_LIMIT',
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error:
            'Maaf, asisten sedang mengalami gangguan. Silakan coba lagi atau hubungi admin via WhatsApp.',
        },
        { status: result.status >= 400 && result.status < 600 ? result.status : 500 }
      )
    }

    const { text, finishReason } = extractText(result.data)

    if (!text) {
      const blocked =
        finishReason === 'SAFETY' ||
        finishReason === 'RECITATION' ||
        finishReason === 'BLOCKLIST'

      return NextResponse.json(
        {
          error: blocked
            ? 'Maaf, saya belum bisa menjawab pertanyaan itu. Coba ubah pertanyaan Anda, atau hubungi admin via WhatsApp.'
            : 'Maaf, saya belum bisa memproses pesan itu. Silakan coba kirim ulang.',
          finishReason,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      text,
      finishReason,
      truncated: finishReason === 'MAX_TOKENS',
      model: result.model,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server chat.' },
      { status: 500 }
    )
  }
}
