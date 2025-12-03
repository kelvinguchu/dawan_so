import { DawanpediaCallout } from './callout.ts'
import { DawanpediaExternalLinks } from './externalLinks.ts'
import { DawanpediaGallery } from './gallery.ts'
import { DawanpediaMediaEmbed } from './mediaEmbed.ts'
import { DawanpediaReferenceList } from './referenceList.ts'
import { DawanpediaRichText } from './richText.ts'
import { DawanpediaQuote } from './quote.ts'
import { DawanpediaStatsTable } from './statsTable.ts'
import { DawanpediaTimeline } from './timeline.ts'

export const DawanpediaBlocks = [
  DawanpediaRichText,
  DawanpediaTimeline,
  DawanpediaCallout,
  DawanpediaQuote,
  DawanpediaGallery,
  DawanpediaMediaEmbed,
  DawanpediaReferenceList,
  DawanpediaExternalLinks,
  DawanpediaStatsTable,
]
