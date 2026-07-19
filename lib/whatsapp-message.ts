/** Bersihkan markdown agar nyaman dibaca di WhatsApp. */
export function stripMarkdownForWhatsApp(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [label](url) → label
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1') // *italic*
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^[*-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/Chat WhatsApp Admin/gi, '')
    .trim()
}

/** Template pesan WA dari hasil estimasi AI — singkat & mudah dipahami admin. */
export function buildWhatsAppConsultMessage(aiReply: string): string {
  const summary = stripMarkdownForWhatsApp(aiReply)

  return [
    'Halo Admin Hypermile,',
    '',
    'Saya ingin konsultasi lanjutan dari estimasi AI chatbot.',
    '',
    'Ringkasan estimasi:',
    summary,
    '',
    'Mohon bantuannya untuk inspeksi / booking. Terima kasih.',
  ].join('\n')
}

export const WHATSAPP_ADMIN_URL = 'https://wa.me/6285900472233'

export function buildWhatsAppAdminLink(prefillText: string): string {
  return `${WHATSAPP_ADMIN_URL}?text=${encodeURIComponent(prefillText)}`
}
