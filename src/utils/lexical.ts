export type LexicalContent = {
  root?: {
    children?: Array<{
      id?: string
      children?: unknown
    }>
  }
} | null

export interface ParagraphNode {
  key: string
  text: string
}

const isTextNode = (node: unknown): node is { text?: unknown } => {
  return typeof node === 'object' && node !== null && 'text' in node
}

const hasStringId = (node: unknown): node is { id: string } => {
  return (
    typeof node === 'object' && node !== null && typeof (node as { id?: unknown }).id === 'string'
  )
}

const extractTextFromChildren = (children: unknown): string => {
  if (!Array.isArray(children)) {
    return ''
  }

  return children
    .map((child) => {
      if (isTextNode(child) && typeof child.text === 'string') {
        return child.text
      }

      if (typeof child === 'object' && child !== null && 'children' in child) {
        return extractTextFromChildren((child as { children?: unknown }).children)
      }

      return ''
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

export const lexicalToParagraphs = (content?: LexicalContent | null): ParagraphNode[] => {
  if (!content?.root?.children) {
    return []
  }

  return content.root.children
    .map((child: { id?: string; children?: unknown }, index: number) => {
      if (typeof child !== 'object' || child === null) {
        return null
      }

      const text = extractTextFromChildren((child as { children?: unknown }).children)

      if (!text) {
        return null
      }

      const keySource = hasStringId(child) ? child.id : `${index}-${text.slice(0, 24)}`

      return {
        key: keySource,
        text,
      }
    })
    .filter((item: ParagraphNode | null): item is ParagraphNode => item !== null)
}

export const lexicalToPlainText = (content?: LexicalContent | null): string => {
  return lexicalToParagraphs(content)
    .map((paragraph) => paragraph.text)
    .join(' ')
    .trim()
}
