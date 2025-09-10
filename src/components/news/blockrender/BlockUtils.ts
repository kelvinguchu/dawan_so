import { Media } from '../../../payload-types'

// Lexical Editor Types
export interface LexicalTextNode {
  type: 'text'
  text: string
  format?: number
  style?: string
  mode?: string
  detail?: number
}

export interface LexicalLinkNode {
  type: 'link'
  url?: string
  fields?: {
    url?: string
  }
  children?: LexicalNode[]
  text?: string
}

export interface LexicalAutoLinkNode {
  type: 'autolink'
  url?: string
  fields?: {
    url?: string
  }
  children?: LexicalNode[]
  text?: string
}

export interface LexicalListItemNode {
  type: 'listitem'
  children?: LexicalNode[]
}

export interface LexicalListNode {
  type: 'list'
  listType?: 'bullet' | 'number' | 'ordered'
  tag?: 'ul' | 'ol'
  children?: LexicalListItemNode[]
}

export interface LexicalParagraphNode {
  type: 'paragraph'
  children?: LexicalNode[]
}

export interface LexicalHeadingNode {
  type: 'heading'
  tag: number
  children?: LexicalNode[]
}

export interface LexicalQuoteNode {
  type: 'quote'
  children?: LexicalParagraphNode[]
}

export interface LexicalCodeNode {
  type: 'code'
  children?: LexicalTextNode[]
}

export interface LexicalImageNode {
  type: 'image'
  src: string
  altText?: string
  caption?: string
  width?: number
  height?: number
}

export interface LexicalUploadNode {
  type: 'upload'
  value: string | Media
}

export interface LexicalHorizontalRuleNode {
  type: 'horizontalrule'
}

export type LexicalNode =
  | LexicalTextNode
  | LexicalLinkNode
  | LexicalAutoLinkNode
  | LexicalParagraphNode
  | LexicalHeadingNode
  | LexicalListNode
  | LexicalListItemNode
  | LexicalQuoteNode
  | LexicalCodeNode
  | LexicalImageNode
  | LexicalUploadNode
  | LexicalHorizontalRuleNode

export interface LexicalRoot {
  type: string
  children: LexicalNode[]
  direction: ('ltr' | 'rtl') | null
  format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
  indent: number
  version: number
}

export interface LexicalContent {
  root: LexicalRoot
  [k: string]: unknown
}

// Block Type Definitions
export interface RichTextBlockData {
  blockType: 'richtext' | 'richText'
  content?: LexicalContent | null
  text?: string
  value?: LexicalContent
  richText?: LexicalContent
  id?: string
  blockName?: string
}

export interface ImageBlockData {
  blockType: 'image'
  image?: (string | null) | Media
  alt?: string
  altText?: string
  id?: string
  blockName?: string
}

export interface VideoBlockData {
  blockType: 'video'
  video: string | Media
  autoplay?: boolean | null
  muted?: boolean | null
  controls?: boolean | null
  loop?: boolean | null
  id?: string
  blockName?: string
}

export interface PDFBlockData {
  blockType: 'pdf'
  pdf: string | Media
  showDownloadButton?: boolean | null
  showPreview?: boolean | null
  previewHeight?: number | null
  id?: string
  blockName?: string
}

export interface EmbedBlockData {
  blockType: 'embed'
  content: string
  title?: string | null
  caption?: string | null
  id?: string
  blockName?: string
}

export interface CoverBlockData {
  blockType: 'cover'
  heading: LexicalContent
  subheading: string
  image?: (string | null) | Media
  id?: string
  blockName?: string
}

// Layout and Misc Block Types
export interface TableRow {
  cells?: Array<{
    content?: string
    text?: string
  }>
}

export interface TableBlockData {
  blockType: 'table'
  rows?: TableRow[]
  id?: string
  blockName?: string
}

export interface LayoutColumn {
  content?: LexicalContent
}

export interface LayoutBlockData {
  blockType: 'layout' | 'columns'
  columns?: LayoutColumn[]
  id?: string
  blockName?: string
}

export interface CollapsibleBlockData {
  blockType: 'collapsible' | 'details'
  summary?: string
  title?: string
  content?: LexicalContent
  id?: string
  blockName?: string
}

export interface SpoilerBlockData {
  blockType: 'spoiler'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface HashtagBlockData {
  blockType: 'hashtag'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface MentionBlockData {
  blockType: 'mention'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface EmojiBlockData {
  blockType: 'emoji'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface LinkBlockData {
  blockType: 'link'
  url?: string
  href?: string
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface AutoLinkBlockData {
  blockType: 'autolink'
  url?: string
  content?: string
  id?: string
  blockName?: string
}

export interface MarkBlockData {
  blockType: 'mark' | 'highlight'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface KeyboardBlockData {
  blockType: 'keyboard' | 'kbd'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface MathBlockData {
  blockType: 'math' | 'equation'
  equation?: string
  content?: string
  text?: string
  id?: string
  blockName?: string
}

export interface SimpleIframeBlockData {
  blockType: 'iframe'
  url?: string
  src?: string
  title?: string
  caption?: string
  id?: string
  blockName?: string
}

export interface SimpleTweetBlockData {
  blockType: 'tweet' | 'twitter'
  text?: string
  content?: string
  username?: string
  id?: string
  blockName?: string
}

export interface FigcaptionBlockData {
  blockType: 'figcaption'
  text?: string
  content?: string
  id?: string
  blockName?: string
}

export interface AudioBlockData {
  blockType: 'audio'
  url?: string
  src?: string
  caption?: string
  id?: string
  blockName?: string
}

export interface HorizontalRuleBlockData {
  blockType: 'horizontalrule' | 'hr' | 'divider'
  id?: string
  blockName?: string
}

export interface LineBreakBlockData {
  blockType: 'linebreak' | 'break'
  id?: string
  blockName?: string
}

export interface TabBlockData {
  blockType: 'tab'
  id?: string
  blockName?: string
}

// Union type for all possible block types
export type BlockType =
  | RichTextBlockData
  | ImageBlockData
  | VideoBlockData
  | PDFBlockData
  | EmbedBlockData
  | CoverBlockData
  | TableBlockData
  | LayoutBlockData
  | CollapsibleBlockData
  | SpoilerBlockData
  | HashtagBlockData
  | MentionBlockData
  | EmojiBlockData
  | LinkBlockData
  | AutoLinkBlockData
  | MarkBlockData
  | KeyboardBlockData
  | MathBlockData
  | SimpleIframeBlockData
  | SimpleTweetBlockData
  | FigcaptionBlockData
  | AudioBlockData
  | HorizontalRuleBlockData
  | LineBreakBlockData
  | TabBlockData

// Block Types Interface
export interface BlockRendererProps {
  block: BlockType
  hideTextOverlay?: boolean
}

// Commonly used block types
export const BLOCK_TYPES = {
  RICHTEXT: 'richtext',
  RICH_TEXT: 'richText',
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
  EMBED: 'embed',
  COVER: 'cover',
  HORIZONTAL_RULE: 'horizontalrule',
  HR: 'hr',
  DIVIDER: 'divider',
  TABLE: 'table',
  LINEBREAK: 'linebreak',
  BREAK: 'break',
  TAB: 'tab',
  HASHTAG: 'hashtag',
  MENTION: 'mention',
  EMOJI: 'emoji',
  LINK: 'link',
  AUTOLINK: 'autolink',
  COLLAPSIBLE: 'collapsible',
  DETAILS: 'details',
  SPOILER: 'spoiler',
  MARK: 'mark',
  HIGHLIGHT: 'highlight',
  KEYBOARD: 'keyboard',
  KBD: 'kbd',
  MATH: 'math',
  EQUATION: 'equation',
  LAYOUT: 'layout',
  COLUMNS: 'columns',
  IFRAME: 'iframe',
  TWEET: 'tweet',
  TWITTER: 'twitter',
  FIGCAPTION: 'figcaption',
  AUDIO: 'audio',
} as const

// Utility function to check if a URL is valid
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Utility function to safely get content from block
export const getBlockContent = (block: BlockType): string => {
  if ('content' in block && typeof block.content === 'string') {
    return block.content
  }
  if ('text' in block && block.text) {
    return block.text
  }
  if ('value' in block && typeof block.value === 'string') {
    return block.value
  }
  return ''
}

// Utility function to check if a block is empty
export const isBlockEmpty = (block: BlockType): boolean => {
  const content = getBlockContent(block)
  return !content || content.trim() === ''
}

// Utility function to normalize block type
export const normalizeBlockType = (blockType: string): string => {
  return blockType?.toLowerCase() || ''
}

// Utility function for consistent spacing classes
export const getBlockSpacing = (blockType: string): string => {
  const type = normalizeBlockType(blockType)

  // Blocks that typically need more spacing
  const largeSpacingBlocks: readonly string[] = [
    BLOCK_TYPES.IMAGE,
    BLOCK_TYPES.VIDEO,
    BLOCK_TYPES.EMBED,
    BLOCK_TYPES.COVER,
    BLOCK_TYPES.PDF,
    BLOCK_TYPES.TABLE,
    BLOCK_TYPES.LAYOUT,
    BLOCK_TYPES.COLUMNS,
  ] as const

  // Blocks that need minimal spacing
  const smallSpacingBlocks: readonly string[] = [
    BLOCK_TYPES.LINEBREAK,
    BLOCK_TYPES.BREAK,
    BLOCK_TYPES.TAB,
    BLOCK_TYPES.FIGCAPTION,
  ] as const

  if (largeSpacingBlocks.includes(type)) {
    return 'my-8'
  } else if (smallSpacingBlocks.includes(type)) {
    return 'my-2'
  }

  return 'my-4'
}

// Utility function to generate fallback content data for unknown blocks
export const generateFallbackContentData = (
  block: BlockType,
): {
  blockType: string
  serializedBlock: string
} => {
  return {
    blockType: block.blockType || 'unknown',
    serializedBlock: JSON.stringify(block, null, 2),
  }
}

// Utility function to check if content is HTML
export const isHtmlContent = (content: string): boolean => {
  const trimmed = content.trim()
  return trimmed.startsWith('<') && trimmed.endsWith('>')
}

// Utility function to extract plain text from HTML
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

// Utility function to truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Utility function to handle external links
export const isExternalLink = (url: string): boolean => {
  return url.startsWith('http') || url.startsWith('//')
}

// Utility function to get responsive image classes
export const getResponsiveImageClasses = (): string => {
  return 'w-full h-auto max-w-full'
}

// Utility function to get responsive video classes
export const getResponsiveVideoClasses = (): string => {
  return 'w-full aspect-video'
}

// Common CSS classes for consistency
export const CSS_CLASSES = {
  CONTAINER: 'max-w-4xl mx-auto',
  CARD: 'bg-white rounded-lg shadow-md border border-gray-200',
  BUTTON_PRIMARY: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
  BUTTON_SECONDARY:
    'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors',
  TEXT_MUTED: 'text-gray-600',
  TEXT_SMALL: 'text-sm',
  LOADING: 'animate-pulse bg-gray-200 rounded',
  ERROR: 'text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg',
  SUCCESS: 'text-green-600 bg-green-50 border border-green-200 p-4 rounded-lg',
  WARNING: 'text-amber-600 bg-amber-50 border border-amber-200 p-4 rounded-lg',
} as const
