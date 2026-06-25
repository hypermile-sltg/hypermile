/**
 * Extracts the 11-character YouTube video ID from various video URL formats.
 * E.g., https://youtu.be/OP4AtnrYmoY?si=mLT-uxLeY43Rp_Qk -> OP4AtnrYmoY
 *       https://www.youtube.com/watch?v=OP4AtnrYmoY -> OP4AtnrYmoY
 *       https://www.youtube.com/embed/OP4AtnrYmoY -> OP4AtnrYmoY
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null
  
  // Clean URL to handle potential whitespace
  const cleanUrl = url.trim()
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = cleanUrl.match(regExp)
  
  return (match && match[2].length === 11) ? match[2] : null
}
