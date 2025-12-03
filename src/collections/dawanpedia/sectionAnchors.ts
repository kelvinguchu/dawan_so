/**
 * Utility for generating consistent anchor IDs from section headings.
 */

export const generateAnchorId = (heading: string): string => {
  return heading
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
}

export const resolveAnchor = (heading: string, fallback: string): string => {
  const generated = generateAnchorId(heading)
  return generated || fallback
}
