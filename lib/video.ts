import { getYouTubeId } from '@/lib/youtube'

/**
 * Detects the type of video URL: 'youtube' | 'instagram' | 'tiktok' | null
 */
export function getVideoType(url: string): 'youtube' | 'instagram' | 'tiktok' | null {
  if (!url) return null
  const u = url.trim().toLowerCase()
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('tiktok.com')) return 'tiktok'
  return null
}

/**
 * Returns whether this video type can be cleanly embedded (YouTube only).
 * Instagram and TikTok cannot be cleanly embedded — open in a new tab instead.
 */
export function isEmbeddable(url: string): boolean {
  return getVideoType(url) === 'youtube' && !!getYouTubeId(url)
}

/**
 * Returns the clean embed URL for a video link (YouTube/Instagram only).
 * Returns null for TikTok or unsupported types.
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null
  const type = getVideoType(url)

  if (type === 'youtube') {
    const id = getYouTubeId(url)
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`
      : null
  }

  if (type === 'instagram') {
    // Extract shortcode from: /reel/CODE/ or /p/CODE/
    const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
    const code = match ? match[2] : null
    return code ? `https://www.instagram.com/reel/${code}/embed/?autoplay=1` : null
  }

  // TikTok: not embeddable cleanly — use openInNewTab instead
  return null
}

/**
 * Returns a thumbnail URL for the video, or null.
 */
export function getVideoThumbnail(url: string): string | null {
  if (!url) return null
  const type = getVideoType(url)
  if (type === 'youtube') {
    const id = getYouTubeId(url)
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
  }
  return null
}
