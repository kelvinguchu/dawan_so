import React from 'react'
import Image from 'next/image'
import { ExternalLink, FileText, Quote, Download } from 'lucide-react'
import { CopyButton } from '../CopyButton'
import { Media } from '../../../payload-types'
import {
  LexicalContent,
  LexicalNode,
  LexicalTextNode,
  LexicalLinkNode,
  LexicalAutoLinkNode,
  LexicalParagraphNode,
  LexicalHeadingNode,
  LexicalListNode,
  LexicalListItemNode,
  LexicalQuoteNode,
  LexicalCodeNode,
  LexicalImageNode,
  LexicalUploadNode,
} from './BlockUtils'

// Rich Text Renderer Component
export const RichTextRenderer: React.FC<{ content: LexicalContent | string | null }> = ({
  content,
}) => {
  // HTML string content - Render directly
  if (typeof content === 'string') {
    return (
      <div
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none article-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Check if content might be stored under a different property name
  const blockContent = content ?? {}

  // Check if we have text content directly (some Payload configs use this structure)
  if ('text' in blockContent && typeof blockContent.text === 'string') {
    return (
      <div
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none article-content"
        dangerouslySetInnerHTML={{ __html: blockContent.text }}
      />
    )
  }

  // URL validation function to prevent XSS attacks
  const isValidUrl = (url: string): boolean => {
    try {
      // Use a base URL that works on both server and client
      const baseUrl = typeof window !== 'undefined' ? window.location.href : 'https://localhost'
      const parsed = new URL(url, baseUrl)
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  // Helper function to extract plain text from children (for anchor IDs)
  const extractPlainText = (children: LexicalNode[]): string => {
    return children
      .map((child: LexicalNode) => {
        if (child.type === 'text' || !child.type) {
          return (child as LexicalTextNode).text || ''
        }
        if ('children' in child && child.children) {
          return extractPlainText(child.children)
        }
        return ''
      })
      .join('')
  }

  // Helper function to render inline text nodes including links and formatting
  const renderTextNodes = (children: LexicalNode[]): React.ReactNode[] => {
    return children.map((textNode: LexicalNode, i: number) => {
      // Handle link nodes (inline)
      if (textNode.type === 'link') {
        const linkNode = textNode as LexicalLinkNode
        const url = linkNode.fields?.url || linkNode.url || ''
        if (!isValidUrl(url)) {
          return (
            <span key={i}>
              {linkNode.children ? renderTextNodes(linkNode.children) : linkNode.text || 'Xiriir'}
            </span>
          )
        }
        const isExternal = url.startsWith('http')

        return (
          <a
            key={i}
            href={url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
          >
              {linkNode.children ? renderTextNodes(linkNode.children) : linkNode.text || 'Xiriir'}
            {isExternal && <ExternalLink className="ml-1 h-3 w-3" />}
          </a>
        )
      }

      // Handle autolink nodes (inline)
      if (textNode.type === 'autolink') {
        const autoLinkNode = textNode as LexicalAutoLinkNode
        const url = autoLinkNode.fields?.url || autoLinkNode.url || ''
        if (!isValidUrl(url)) {
          return (
            <span key={i}>
              {autoLinkNode.children
                ? renderTextNodes(autoLinkNode.children)
                : autoLinkNode.text || url}
            </span>
          )
        }
        const isExternal = url.startsWith('http')

        return (
          <a
            key={i}
            href={url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
          >
            {autoLinkNode.children
              ? renderTextNodes(autoLinkNode.children)
              : autoLinkNode.text || url}
            {isExternal && <ExternalLink className="ml-1 h-3 w-3" />}
          </a>
        )
      }

      // Handle regular text nodes with formatting
      if (textNode.type === 'text' || !textNode.type) {
        const textNodeData = textNode as LexicalTextNode
        const textContent = textNodeData.text || ''
        let className = ''

        // Apply text formatting based on format bitmask
        if (textNodeData.format) {
          if (textNodeData.format & 1) className += ' font-bold'
          if (textNodeData.format & 2) className += ' italic'
          if (textNodeData.format & 4) className += ' underline'
          if (textNodeData.format & 8) className += ' line-through'
          if (textNodeData.format & 16) className += ' text-sm'
          if (textNodeData.format & 32) className += ' uppercase'
          if (textNodeData.format & 64)
            className += ' text-code inline bg-gray-100 px-1.5 py-0.5 rounded font-mono'
        }

        return (
          <span key={i} className={className || undefined}>
            {textContent}
          </span>
        )
      }

      // Handle other inline node types that might have children
      if ('children' in textNode && textNode.children) {
        return <span key={i}>{renderTextNodes(textNode.children)}</span>
      }

      // Fallback for unknown inline node types
      const fallbackText = 'text' in textNode ? String(textNode.text) : ''
      return <span key={i}>{fallbackText}</span>
    })
  }

  // Lexical editor structure handling
  if ('root' in blockContent && (blockContent as LexicalContent).root?.children) {
    // Convert Lexical structure to JSX
    const lexicalContent = blockContent as LexicalContent
    return (
      <div className="article-content">
        {lexicalContent.root.children.map((node: LexicalNode, index: number) => {
          switch (node.type) {
            case 'paragraph': {
              const paragraphNode = node as LexicalParagraphNode
              return (
                <p key={index} className="relative group">
                  {paragraphNode.children ? renderTextNodes(paragraphNode.children) : ''}
                </p>
              )
            }
            case 'heading': {
              const headingNode = node as LexicalHeadingNode
              // Create the appropriate heading level
              const tag = headingNode.tag || 2 // Default to h2 if not specified
              const headingContent = headingNode.children
                ? extractPlainText(headingNode.children)
                : ''

              if (tag === 1) {
                return (
                  <h1 key={index} className="scroll-mt-24 group">
                    <a
                      href={`#${headingContent.toLowerCase().replace(/\s+/g, '-')}`}
                      className="no-underline"
                    >
                      {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                      <span className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 transition-opacity">
                        #
                      </span>
                    </a>
                  </h1>
                )
              } else if (tag === 2) {
                return (
                  <h2
                    key={index}
                    className="scroll-mt-24 group"
                    id={headingContent.toLowerCase().replace(/\s+/g, '-')}
                  >
                    <a
                      href={`#${headingContent.toLowerCase().replace(/\s+/g, '-')}`}
                      className="no-underline"
                    >
                      {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                      <span className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 transition-opacity">
                        #
                      </span>
                    </a>
                  </h2>
                )
              } else if (tag === 3) {
                return (
                  <h3
                    key={index}
                    className="scroll-mt-24 group"
                    id={headingContent.toLowerCase().replace(/\s+/g, '-')}
                  >
                    <a
                      href={`#${headingContent.toLowerCase().replace(/\s+/g, '-')}`}
                      className="no-underline"
                    >
                      {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                      <span className="opacity-0 group-hover:opacity-100 ml-2 text-blue-500 transition-opacity">
                        #
                      </span>
                    </a>
                  </h3>
                )
              } else if (tag === 4) {
                return (
                  <h4 key={index}>
                    {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                  </h4>
                )
              } else if (tag === 5) {
                return (
                  <h5 key={index}>
                    {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                  </h5>
                )
              } else {
                return (
                  <h6 key={index}>
                    {headingNode.children ? renderTextNodes(headingNode.children) : ''}
                  </h6>
                )
              }
            }
            case 'list': {
              const listNode = node as LexicalListNode
              // Handle both listType and tag properties for different Lexical versions
              const isOrderedList =
                listNode.listType === 'number' ||
                listNode.listType === 'ordered' ||
                listNode.tag === 'ol'
              const ListTag = isOrderedList ? 'ol' : 'ul'

              return (
                <ListTag
                  key={index}
                  className={`my-4 ml-6 space-y-2 ${isOrderedList ? 'list-decimal' : 'list-disc'}`}
                >
                  {listNode.children &&
                    listNode.children.map((listItem: LexicalListItemNode, i: number) => {
                      // Handle different types of list item structures
                      if (listItem.type === 'listitem') {
                        // Standard Lexical list item
                        return (
                          <li key={i}>
                            {listItem.children &&
                              listItem.children.map((childNode: LexicalNode, j: number) => {
                                // Handle nested content within list items
                                if (childNode.type === 'paragraph') {
                                  const childParagraphNode = childNode as LexicalParagraphNode
                                  return (
                                    <div key={j} className="inline">
                                      {childParagraphNode.children
                                        ? renderTextNodes(childParagraphNode.children)
                                        : ''}
                                    </div>
                                  )
                                } else if (childNode.type === 'list') {
                                  // Nested list - recursively handle
                                  const nestedListNode = childNode as LexicalListNode
                                  const nestedIsOrdered =
                                    nestedListNode.listType === 'number' ||
                                    nestedListNode.listType === 'ordered' ||
                                    nestedListNode.tag === 'ol'
                                  const NestedListTag = nestedIsOrdered ? 'ol' : 'ul'
                                  return (
                                    <NestedListTag
                                      key={j}
                                      className={`mt-2 ml-6 space-y-1 ${nestedIsOrdered ? 'list-decimal' : 'list-disc'}`}
                                    >
                                      {nestedListNode.children &&
                                        nestedListNode.children.map(
                                          (nestedItem: LexicalListItemNode, k: number) => (
                                            <li key={k}>
                                              {nestedItem.children &&
                                                nestedItem.children.map(
                                                  (nestedChild: LexicalNode, l: number) => {
                                                    if (
                                                      'children' in nestedChild &&
                                                      nestedChild.children
                                                    ) {
                                                      return (
                                                        <React.Fragment key={l}>
                                                          {renderTextNodes(nestedChild.children)}
                                                        </React.Fragment>
                                                      )
                                                    } else if (nestedChild.type === 'text') {
                                                      // Handle direct text nodes with formatting
                                                      return (
                                                        <React.Fragment key={l}>
                                                          {renderTextNodes([nestedChild])}
                                                        </React.Fragment>
                                                      )
                                                    } else {
                                                      return null
                                                    }
                                                  },
                                                )}
                                            </li>
                                          ),
                                        )}
                                    </NestedListTag>
                                  )
                                } else {
                                  // Other content types within list items - handle all text formatting
                                  if ('children' in childNode && childNode.children) {
                                    return (
                                      <React.Fragment key={j}>
                                        {renderTextNodes(childNode.children)}
                                      </React.Fragment>
                                    )
                                  } else if (childNode.type === 'text') {
                                    // Handle direct text nodes with formatting
                                    return (
                                      <React.Fragment key={j}>
                                        {renderTextNodes([childNode])}
                                      </React.Fragment>
                                    )
                                  } else {
                                    return null
                                  }
                                }
                              })}
                          </li>
                        )
                      } else {
                        // Fallback for non-standard list item structure
                        return (
                          <li key={i}>
                            {listItem.children &&
                              listItem.children.map((paraNode: LexicalNode, j: number) => {
                                if ('children' in paraNode && paraNode.children) {
                                  return (
                                    <React.Fragment key={j}>
                                      {renderTextNodes(paraNode.children)}
                                    </React.Fragment>
                                  )
                                } else if (paraNode.type === 'text') {
                                  // Handle direct text nodes with formatting
                                  return (
                                    <React.Fragment key={j}>
                                      {renderTextNodes([paraNode])}
                                    </React.Fragment>
                                  )
                                } else {
                                  return null
                                }
                              })}
                          </li>
                        )
                      }
                    })}
                </ListTag>
              )
            }
            case 'quote': {
              const quoteNode = node as LexicalQuoteNode
              return (
                <blockquote
                  key={index}
                  className="relative pl-6 py-2 my-8 text-gray-700 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg"
                >
                  <Quote className="absolute left-4 top-4 text-blue-300/30 h-16 w-16 -z-10" />
                  <div className="relative z-10">
                    {quoteNode.children &&
                      quoteNode.children.map((paraNode: LexicalParagraphNode, i: number) => (
                        <p key={i} className="italic ">
                          {paraNode.children ? renderTextNodes(paraNode.children) : ''}
                        </p>
                      ))}
                  </div>
                </blockquote>
              )
            }
            case 'listitem': {
              const listItemNode = node as LexicalListItemNode
              // Handle standalone list items (might appear in some Lexical structures)
              return (
                <li key={index} className="my-2 ml-6 list-disc">
                  {listItemNode.children &&
                    listItemNode.children.map((childNode: LexicalNode, j: number) => {
                      if (childNode.type === 'paragraph') {
                        const childParagraphNode = childNode as LexicalParagraphNode
                        return (
                          <div key={j} className="inline">
                            {childParagraphNode.children
                              ? renderTextNodes(childParagraphNode.children)
                              : ''}
                          </div>
                        )
                      } else {
                        // Handle all other content types with proper text formatting
                        if ('children' in childNode && childNode.children) {
                          return (
                            <React.Fragment key={j}>
                              {renderTextNodes(childNode.children)}
                            </React.Fragment>
                          )
                        } else if (childNode.type === 'text') {
                          // Handle direct text nodes with formatting
                          return (
                            <React.Fragment key={j}>{renderTextNodes([childNode])}</React.Fragment>
                          )
                        } else {
                          return null
                        }
                      }
                    })}
                </li>
              )
            }
            case 'code': {
              const codeNode = node as LexicalCodeNode
              const codeText =
                codeNode.children
                  ?.map((textNode: LexicalTextNode) => textNode.text || '')
                  .join('\n') || ''
              return (
                <div key={index} className="my-6">
                  <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 text-sm rounded-t-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Koodh</span>
                  </div>
                  <CopyButton text={codeText} />
                </div>
                  <pre className="bg-gray-900 p-4 rounded-b-md overflow-auto text-gray-100">
                    <code>{codeText}</code>
                  </pre>
                </div>
              )
            }
            case 'image': {
              const imageNode = node as LexicalImageNode
              if (imageNode.src) {
                return (
                  <figure key={index} className="my-8">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={imageNode.src}
                        alt={imageNode.altText || ''}
                        width={imageNode.width || 800}
                        height={imageNode.height || 600}
                        className="w-full h-auto"
                      />
                    </div>
                    {imageNode.caption && (
                      <figcaption className="text-center text-gray-600 mt-3 text-sm">
                        {imageNode.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }
              return null
            }
            case 'upload': {
              const uploadNode = node as LexicalUploadNode
              // Handle upload nodes from Lexical editor
              if (!uploadNode.value) return null

              const uploadData: Media | null =
                typeof uploadNode.value === 'string'
                  ? null // TODO: resolve from a pre-loaded media map if available
                  : (uploadNode.value as Media)

              if (!uploadData) {
                // If we have a string ID but no resolved data, show a placeholder
                return (
                  <div
                    key={index}
                    className="my-8 p-4 bg-gray-50 border border-gray-300 rounded-lg text-center"
                  >
                    <p className="text-gray-600 text-sm">
                      Media content (ID:{' '}
                      {typeof uploadNode.value === 'string' ? uploadNode.value : 'unknown'}) -
                      requires population to display
                    </p>
                  </div>
                )
              }

              const isVideo = uploadData.mimeType?.startsWith('video/')
              const isPDF = uploadData.mimeType === 'application/pdf'
              const isImage = uploadData.mimeType?.startsWith('image/')

              if (isVideo) {
                return (
                  <figure key={index} className="my-8">
                    <div className="rounded-lg overflow-hidden shadow-lg bg-black">
                      <video
                        src={uploadData.url || ''}
                        controls
                        className="w-full h-auto"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {uploadData.caption && (
                      <figcaption className="text-center text-gray-600 mt-3 text-sm">
                        {uploadData.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              } else if (isPDF) {
                return (
                  <div
                    key={index}
                    className="my-8 border border-gray-300 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {uploadData.filename || 'Dukumenti'}
                            </h3>
                            {uploadData.caption && (
                              <p className="text-sm text-gray-600 mt-1">{uploadData.caption}</p>
                            )}
                          </div>
                        </div>
                        <a
                          href={uploadData.url || ''}
                          download
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Soo deji
                        </a>
                      </div>
                    </div>
                    <div className="bg-white">
                      <iframe
                        src={`${uploadData.url || ''}#toolbar=1`}
                        width="100%"
                        height={600}
                        className="border-0"
                        title={uploadData.filename || 'Dukumenti'}
                      >
                        <p>
                          Brawser-kaagu ma taageero PDFs.
                          <a
                            href={uploadData.url || ''}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Soo deji PDF-ga
                          </a>
                        </p>
                      </iframe>
                    </div>
                  </div>
                )
              } else if (isImage) {
                return (
                  <figure key={index} className="my-8">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={uploadData.url || ''}
                        alt={uploadData.alt || ''}
                        width={uploadData.width || 800}
                        height={uploadData.height || 600}
                        className="w-full h-auto"
                      />
                    </div>
                    {uploadData.caption && (
                      <figcaption className="text-center text-gray-600 mt-3 text-sm">
                        {uploadData.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              return null
            }
            case 'horizontalrule': {
              return <hr key={index} className="my-8 border-0 h-0.5 bg-gray-300 w-full" />
            }
            default:
              // Handle any other node types
              return <div key={index}>[Nooc block aan la taageerin: {node.type}]</div>
          }
        })}
      </div>
    )
  }

  return (
    <div className="article-content">
      <p className="text-gray-700 italic">[Dhibaato qaab-dhismeed — lama soo bandhigi karo nuxurka]</p>
    </div>
  )
}
