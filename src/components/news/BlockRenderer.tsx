import React from 'react'
import { RichTextRenderer } from './blockrender/RichTextRenderer'
import { ImageBlock, CoverBlock, VideoBlock } from './blockrender/MediaBlocks'
import { EmbedBlock, PDFBlock } from './blockrender/EmbedBlocks'
import {
  TableBlock,
  LayoutBlock,
  CollapsibleBlock,
  SpoilerBlock,
  HashtagBlock,
  MentionBlock,
  EmojiBlock,
  LinkBlock,
  AutoLinkBlock,
  MarkBlock,
  KeyboardBlock,
  MathBlock,
  SimpleIframeBlock,
  SimpleTweetBlock,
  FigcaptionBlock,
  AudioBlock,
  LineBreakBlock,
  TabBlock,
  HorizontalRuleBlock,
  FallbackBlock,
  setBlockRendererReference,
} from './blockrender/LayoutBlocks'
import {
  BlockRendererProps,
  BlockType,
  RichTextBlockData,
  ImageBlockData,
  VideoBlockData,
  PDFBlockData,
  EmbedBlockData,
  CoverBlockData,
  TableBlockData,
  HashtagBlockData,
  MentionBlockData,
  EmojiBlockData,
  LinkBlockData,
  AutoLinkBlockData,
  CollapsibleBlockData,
  SpoilerBlockData,
  MarkBlockData,
  KeyboardBlockData,
  MathBlockData,
  LayoutBlockData,
  SimpleIframeBlockData,
  SimpleTweetBlockData,
  FigcaptionBlockData,
  AudioBlockData,
} from './blockrender/BlockUtils'

// Helper function to convert null to undefined for component props
const nullToUndefined = <T,>(value: T | null | undefined): T | undefined => {
  return value === null ? undefined : value
}

// This component will map blockType to the actual rendering component
export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, hideTextOverlay }) => {
  // Set the reference for recursive calls in LayoutBlocks
  React.useEffect(() => {
    setBlockRendererReference(BlockRenderer)
  }, [])

  // Ensure block conforms to BlockType interface structure
  const typedBlock = block as BlockType

  switch (typedBlock.blockType?.toLowerCase()) {
    case 'richtext':
    case 'richText': {
      const richtextBlock = typedBlock as RichTextBlockData
      // Try different property names that Payload CMS might use for rich text content
      const richtextContent =
        richtextBlock.content ||
        richtextBlock.text ||
        richtextBlock.value ||
        richtextBlock.richText ||
        null
      return <RichTextRenderer content={richtextContent} />
    }

    case 'image': {
      const imageBlock = typedBlock as ImageBlockData
      return (
        <ImageBlock
          image={imageBlock.image ?? null}
          altText={nullToUndefined(imageBlock.alt || imageBlock.altText)}
        />
      )
    }

    case 'video': {
      const videoBlock = typedBlock as VideoBlockData
      return (
        <VideoBlock
          video={videoBlock.video}
          autoplay={nullToUndefined(videoBlock.autoplay)}
          muted={nullToUndefined(videoBlock.muted)}
          controls={nullToUndefined(videoBlock.controls)}
          loop={nullToUndefined(videoBlock.loop)}
        />
      )
    }

    case 'pdf': {
      const pdfBlock = typedBlock as PDFBlockData
      return (
        <PDFBlock
          pdf={pdfBlock.pdf}
          showDownloadButton={nullToUndefined(pdfBlock.showDownloadButton)}
          showPreview={nullToUndefined(pdfBlock.showPreview)}
          previewHeight={nullToUndefined(pdfBlock.previewHeight)}
        />
      )
    }

    case 'embed': {
      const embedBlock = typedBlock as EmbedBlockData
      return (
        <EmbedBlock
          content={embedBlock.content}
          title={nullToUndefined(embedBlock.title)}
          caption={nullToUndefined(embedBlock.caption)}
        />
      )
    }

    case 'cover': {
      const coverBlock = typedBlock as CoverBlockData
      return (
        <CoverBlock
          image={coverBlock.image}
          heading={coverBlock.heading}
          subheading={coverBlock.subheading}
          hideTextOverlay={hideTextOverlay}
        />
      )
    }

    case 'horizontalrule':
    case 'hr':
    case 'divider':
      return <HorizontalRuleBlock />

    case 'table': {
      const tableBlock = typedBlock as TableBlockData
      return <TableBlock rows={tableBlock.rows} />
    }

    case 'linebreak':
    case 'break':
      return <LineBreakBlock />

    case 'tab':
      return <TabBlock />

    case 'hashtag': {
      const hashtagBlock = typedBlock as HashtagBlockData
      return <HashtagBlock text={hashtagBlock.text} content={hashtagBlock.content} />
    }

    case 'mention': {
      const mentionBlock = typedBlock as MentionBlockData
      return <MentionBlock text={mentionBlock.text} content={mentionBlock.content} />
    }

    case 'emoji': {
      const emojiBlock = typedBlock as EmojiBlockData
      return <EmojiBlock text={emojiBlock.text} content={emojiBlock.content} />
    }

    case 'link': {
      const linkBlock = typedBlock as LinkBlockData
      return (
        <LinkBlock
          url={linkBlock.url || linkBlock.href}
          text={linkBlock.text}
          content={linkBlock.content}
        />
      )
    }

    case 'autolink': {
      const autolinkBlock = typedBlock as AutoLinkBlockData
      return <AutoLinkBlock url={autolinkBlock.url} content={autolinkBlock.content} />
    }

    case 'collapsible':
    case 'details': {
      const collapsibleBlock = typedBlock as CollapsibleBlockData
      return (
        <CollapsibleBlock
          summary={collapsibleBlock.summary || collapsibleBlock.title}
          content={collapsibleBlock.content}
        />
      )
    }

    case 'spoiler': {
      const spoilerBlock = typedBlock as SpoilerBlockData
      return <SpoilerBlock text={spoilerBlock.text} content={spoilerBlock.content} />
    }

    case 'mark':
    case 'highlight': {
      const markBlock = typedBlock as MarkBlockData
      return <MarkBlock text={markBlock.text} content={markBlock.content} />
    }

    case 'keyboard':
    case 'kbd': {
      const keyboardBlock = typedBlock as KeyboardBlockData
      return <KeyboardBlock text={keyboardBlock.text} content={keyboardBlock.content} />
    }

    case 'math':
    case 'equation': {
      const mathBlock = typedBlock as MathBlockData
      return (
        <MathBlock
          equation={mathBlock.equation}
          content={mathBlock.content}
          text={mathBlock.text}
        />
      )
    }

    case 'layout':
    case 'columns': {
      const layoutBlock = typedBlock as LayoutBlockData
      return <LayoutBlock columns={layoutBlock.columns} />
    }

    case 'iframe': {
      const iframeBlock = typedBlock as SimpleIframeBlockData
      return (
        <SimpleIframeBlock
          url={iframeBlock.url || iframeBlock.src}
          title={iframeBlock.title}
          caption={iframeBlock.caption}
        />
      )
    }

    case 'tweet':
    case 'twitter': {
      const tweetBlock = typedBlock as SimpleTweetBlockData
      return (
        <SimpleTweetBlock
          text={tweetBlock.text}
          content={tweetBlock.content}
          username={tweetBlock.username}
        />
      )
    }

    case 'figcaption': {
      const figcaptionBlock = typedBlock as FigcaptionBlockData
      return <FigcaptionBlock text={figcaptionBlock.text} content={figcaptionBlock.content} />
    }

    case 'audio': {
      const audioBlock = typedBlock as AudioBlockData
      return <AudioBlock url={audioBlock.url || audioBlock.src} caption={audioBlock.caption} />
    }

    default:
      return <FallbackBlock block={typedBlock} />
  }
}

export default BlockRenderer
