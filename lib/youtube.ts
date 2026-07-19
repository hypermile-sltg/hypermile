/**
 * Extracts the 11-character YouTube video ID from various video URL formats.
 * E.g., https://youtu.be/OP4AtnrYmoY?si=mLT-uxLeY43Rp_Qk -> OP4AtnrYmoY
 *       https://www.youtube.com/watch?v=OP4AtnrYmoY -> OP4AtnrYmoY
 *       https://www.youtube.com/embed/OP4AtnrYmoY -> OP4AtnrYmoY
 *       https://www.youtube.com/shorts/OP4AtnrYmoY -> OP4AtnrYmoY
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null

  const cleanUrl = url.trim()

  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]{11}).*/
  const match = cleanUrl.match(regExp)

  return match?.[2] ?? null
}
