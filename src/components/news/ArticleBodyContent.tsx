import React from 'react'
import { BlogPost } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { RecentNewsItem } from '@/components/home/RecentNewsItem'
import { getPostImageFromLayout } from '@/utils/postUtils'
import type { BlockType, RichTextBlockData, LexicalContent } from './blockrender/BlockUtils'

const renderEmptyContentMessage = () => (
  <div className="article-content prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
    <p>Maqaalkan weli kuma jiraan qaybo nuxur.</p>
  </div>
)

type RichTextSourceKey = 'content' | 'text' | 'value' | 'richText'

type ProcessedBlock = {
  block: BlockType
  blockId: string
  hideTextOverlay: boolean
}

type Segment = {
  node: React.ReactNode
  units: number
}

const isRichTextBlock = (block: BlockType): block is RichTextBlockData => {
  const type = block.blockType?.toLowerCase()
  return type === 'richtext' || type === 'rich_text'
}

const deepClone = <T,>(value: T): T => structuredClone(value)

const resolveRichTextSource = (
  block: RichTextBlockData,
): { key: RichTextSourceKey; value: LexicalContent | string | null } => {
  if (block.content) {
    return typeof block.content === 'string'
      ? { key: 'text', value: block.content }
      : { key: 'content', value: block.content }
  }

  if (block.value) {
    return typeof block.value === 'string'
      ? { key: 'text', value: block.value }
      : { key: 'value', value: block.value }
  }

  if (block.richText) {
    return typeof block.richText === 'string'
      ? { key: 'text', value: block.richText }
      : { key: 'richText', value: block.richText }
  }

  if (typeof block.text === 'string') {
    return { key: 'text', value: block.text }
  }

  return { key: 'content', value: null }
}

const getRichTextUnits = (value: LexicalContent | string | null): number => {
  if (!value) {
    return 0
  }

  if (typeof value === 'string') {
    const paragraphMatches = value.match(/<p[\s\S]*?<\/p>/gi)
    if (paragraphMatches && paragraphMatches.length > 0) {
      return paragraphMatches.length
    }
    return value.trim() ? 1 : 0
  }

  const children = value.root?.children
  if (Array.isArray(children) && children.length > 0) {
    return children.length
  }

  return 0
}

const getBlockUnits = (block: BlockType): number => {
  if (isRichTextBlock(block)) {
    const { value } = resolveRichTextSource(block)
    return Math.max(getRichTextUnits(value), 1)
  }

  return 1
}

const buildRichTextBlockPart = (
  base: RichTextBlockData,
  sourceKey: RichTextSourceKey,
  value: LexicalContent | string,
  suffix: string,
): RichTextBlockData => {
  const resolvedId = suffix || `${base.id ?? base.blockName ?? 'richtext'}-part`
  const cloned: RichTextBlockData = {
    ...base,
    id: resolvedId,
  }

  cloned.content = undefined
  cloned.value = undefined
  cloned.richText = undefined
  cloned.text = undefined

  if (typeof value === 'string') {
    cloned.text = value
    return cloned
  }

  if (sourceKey === 'content') {
    cloned.content = value
  } else if (sourceKey === 'value') {
    cloned.value = value
  } else if (sourceKey === 'richText') {
    cloned.richText = value
  } else {
    cloned.content = value
  }

  return cloned
}

const splitRichTextBlock = (
  block: RichTextBlockData,
  blockId: string,
  unitsForFirstPart: number,
): {
  firstBlock: RichTextBlockData | null
  secondBlock: RichTextBlockData | null
  firstUnits: number
  secondUnits: number
  didSplit: boolean
} => {
  const { key, value } = resolveRichTextSource(block)
  const totalUnits = Math.max(getRichTextUnits(value), 1)

  if (!value || totalUnits <= 1) {
    return {
      firstBlock: block,
      secondBlock: null,
      firstUnits: totalUnits,
      secondUnits: 0,
      didSplit: false,
    }
  }

  const normalizedFirstUnits = Math.min(Math.max(unitsForFirstPart, 1), totalUnits - 1)

  if (typeof value === 'string') {
    const paragraphs = value.match(/<p[\s\S]*?<\/p>/gi)
    if (!paragraphs || paragraphs.length <= 1) {
      return {
        firstBlock: block,
        secondBlock: null,
        firstUnits: totalUnits,
        secondUnits: 0,
        didSplit: false,
      }
    }

    const firstHtml = paragraphs.slice(0, normalizedFirstUnits).join('')
    const secondHtml = paragraphs.slice(normalizedFirstUnits).join('')

    if (!firstHtml || !secondHtml) {
      return {
        firstBlock: block,
        secondBlock: null,
        firstUnits: totalUnits,
        secondUnits: 0,
        didSplit: false,
      }
    }

    const firstBlock = buildRichTextBlockPart(block, key, firstHtml, `${blockId}-part1`)
    const secondBlock = buildRichTextBlockPart(block, key, secondHtml, `${blockId}-part2`)

    return {
      firstBlock,
      secondBlock,
      firstUnits: normalizedFirstUnits,
      secondUnits: totalUnits - normalizedFirstUnits,
      didSplit: true,
    }
  }

  const lexicalContent = value
  const children = Array.isArray(lexicalContent.root?.children) ? lexicalContent.root.children : []

  if (!children.length || normalizedFirstUnits >= children.length) {
    return {
      firstBlock: block,
      secondBlock: null,
      firstUnits: totalUnits,
      secondUnits: 0,
      didSplit: false,
    }
  }

  const firstContent = deepClone(lexicalContent)
  const secondContent = deepClone(lexicalContent)

  firstContent.root.children = firstContent.root.children.slice(0, normalizedFirstUnits)
  secondContent.root.children = secondContent.root.children.slice(normalizedFirstUnits)

  if (!secondContent.root.children.length) {
    return {
      firstBlock: block,
      secondBlock: null,
      firstUnits: totalUnits,
      secondUnits: 0,
      didSplit: false,
    }
  }

  const firstBlock = buildRichTextBlockPart(block, key, firstContent, `${blockId}-part1`)
  const secondBlock = buildRichTextBlockPart(block, key, secondContent, `${blockId}-part2`)

  return {
    firstBlock,
    secondBlock,
    firstUnits: normalizedFirstUnits,
    secondUnits: totalUnits - normalizedFirstUnits,
    didSplit: true,
  }
}

const createProcessedBlocks = (post: BlogPost, firstBlockIsCover: boolean): ProcessedBlock[] => {
  if (!post.layout || post.layout.length === 0) {
    return []
  }

  return post.layout.reduce<ProcessedBlock[]>((acc, block, index) => {
    const blockType = block.blockType?.toLowerCase()
    if (index === 0 && (blockType === 'cover' || blockType === 'image')) {
      return acc
    }

    const identifier =
      typeof block === 'object' && block !== null && 'id' in block && block.id
        ? String(block.id)
        : `${post.id}-block-${index}`

    const processed: ProcessedBlock = {
      block: block as BlockType,
      blockId: identifier,
      hideTextOverlay: index === 0 && firstBlockIsCover,
    }

    return acc.concat(processed)
  }, [])
}

const buildSegmentKey = (primaryId: string | null | undefined, fallback: string): string => {
  return primaryId ? String(primaryId) : fallback
}

const createSegmentEntries = ({
  processedBlock,
  units,
  traversedUnits,
  halfUnits,
  hasMidRecommendation,
}: {
  processedBlock: ProcessedBlock
  units: number
  traversedUnits: number
  halfUnits: number
  hasMidRecommendation: boolean
}): Segment[] => {
  const { block, blockId, hideTextOverlay } = processedBlock

  const shouldSplit =
    hasMidRecommendation &&
    isRichTextBlock(block) &&
    traversedUnits < halfUnits &&
    traversedUnits + units > halfUnits &&
    units > 1

  if (shouldSplit) {
    const unitsNeeded = Math.min(Math.max(Math.round(halfUnits - traversedUnits), 1), units - 1)
    const splitResult = splitRichTextBlock(block, blockId, unitsNeeded)

    if (splitResult.didSplit && splitResult.firstBlock && splitResult.secondBlock) {
      const firstKey = buildSegmentKey(splitResult.firstBlock.id, `${blockId}-part1`)
      const secondKey = buildSegmentKey(splitResult.secondBlock.id, `${blockId}-part2`)

      return [
        {
          node: (
            <BlockRenderer
              key={firstKey}
              block={splitResult.firstBlock as unknown as BlockType}
              hideTextOverlay={hideTextOverlay}
            />
          ),
          units: splitResult.firstUnits,
        },
        {
          node: (
            <BlockRenderer
              key={secondKey}
              block={splitResult.secondBlock as unknown as BlockType}
              hideTextOverlay={false}
            />
          ),
          units: splitResult.secondUnits,
        },
      ]
    }
  }

  return [
    {
      node: <BlockRenderer key={blockId} block={block} hideTextOverlay={hideTextOverlay} />,
      units,
    },
  ]
}

const buildSegments = (
  processedBlocks: ProcessedBlock[],
  hasMidRecommendation: boolean,
): { segments: Segment[]; halfUnits: number } => {
  const totalUnits = processedBlocks.reduce((sum, item) => sum + getBlockUnits(item.block), 0)

  if (totalUnits === 0) {
    return { segments: [], halfUnits: 0 }
  }

  const halfUnits = totalUnits / 2
  let traversedUnits = 0
  let segments: Segment[] = []

  for (const processedBlock of processedBlocks) {
    const units = Math.max(getBlockUnits(processedBlock.block), 1)
    const entries = createSegmentEntries({
      processedBlock,
      units,
      traversedUnits,
      halfUnits,
      hasMidRecommendation,
    })
    segments = segments.concat(entries)
    traversedUnits += units
  }

  return { segments, halfUnits }
}

const splitSegmentsIntoHalves = (
  segments: Segment[],
  halfUnits: number,
  hasMidRecommendation: boolean,
): { firstHalfNodes: React.ReactNode[]; secondHalfNodes: React.ReactNode[] } => {
  if (!hasMidRecommendation) {
    return {
      firstHalfNodes: segments.map((segment) => segment.node),
      secondHalfNodes: [],
    }
  }

  let firstHalfNodes: React.ReactNode[] = []
  let secondHalfNodes: React.ReactNode[] = []
  let consumedUnits = 0

  for (const segment of segments) {
    if (consumedUnits < halfUnits) {
      if (consumedUnits + segment.units <= halfUnits || secondHalfNodes.length === 0) {
        firstHalfNodes = firstHalfNodes.concat(segment.node)
      } else {
        secondHalfNodes = secondHalfNodes.concat(segment.node)
      }
    } else {
      secondHalfNodes = secondHalfNodes.concat(segment.node)
    }

    consumedUnits += segment.units
  }

  return { firstHalfNodes, secondHalfNodes }
}

export interface ArticleBodyContentProps {
  post: BlogPost
  firstBlockIsCover: boolean
  midRecommendations?: BlogPost[]
  endRecommendations?: BlogPost[]
}

export const ArticleBodyContent: React.FC<ArticleBodyContentProps> = ({
  post,
  firstBlockIsCover,
  midRecommendations = [],
  endRecommendations = [],
}) => {
  const processedBlocks = createProcessedBlocks(post, firstBlockIsCover)
  const midRecommendationItems = midRecommendations.slice(0, 2)
  const endRecommendationItems = endRecommendations.slice(0, 2)

  if (!processedBlocks.length) {
    return renderEmptyContentMessage()
  }

  const hasMidRecommendations = midRecommendationItems.length > 0
  const { segments, halfUnits } = buildSegments(processedBlocks, hasMidRecommendations)

  if (!segments.length) {
    return renderEmptyContentMessage()
  }

  const { firstHalfNodes, secondHalfNodes } = splitSegmentsIntoHalves(
    segments,
    halfUnits,
    hasMidRecommendations,
  )

  return (
    <>
      {firstHalfNodes.length > 0 ? <div className="article-content">{firstHalfNodes}</div> : null}

      {midRecommendationItems.length > 0 ? (
        <div className="mx-auto my-6 max-w-3xl rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-2 sm:px-5">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-500">
              Maqaallo la xidhiidha
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {midRecommendationItems.map((recommendation) => {
              const imageUrl = getPostImageFromLayout(recommendation.layout)
              return (
                <RecentNewsItem
                  key={`mid-rec-${recommendation.id}`}
                  post={recommendation}
                  imageUrl={imageUrl}
                />
              )
            })}
          </div>
        </div>
      ) : null}

      {secondHalfNodes.length > 0 ? (
        <div className="article-content mt-6">{secondHalfNodes}</div>
      ) : null}

      {endRecommendationItems.length > 0 ? (
        <div className="mt-10 flex flex-col gap-3">
          <div className="px-1 sm:px-2">
            <p className="text-sm sm:text-base font-semibold text-gray-700">
              Maqaallo kale oo aan kuu doorannay
            </p>
          </div>
          {endRecommendationItems.map((recommendation) => {
            const imageUrl = getPostImageFromLayout(recommendation.layout)
            return (
              <div
                key={`end-rec-${recommendation.id}`}
                className="rounded-lg border border-gray-100 bg-white shadow-sm"
              >
                <RecentNewsItem post={recommendation} imageUrl={imageUrl} />
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}

export default ArticleBodyContent
