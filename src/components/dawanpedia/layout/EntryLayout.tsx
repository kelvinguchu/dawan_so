import type { ReactNode } from 'react'
import { MobileSectionsSheet } from './MobileSectionsSheet'

export interface EntryLayoutProps {
  hero: ReactNode
  sidebar: ReactNode
  children: ReactNode
  related?: ReactNode
}

export function EntryLayout({ hero, sidebar, children, related }: Readonly<EntryLayoutProps>) {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto w-full px-4 py-4">
        <div className="lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-32 lg:top-[180px] flex flex-col gap-6">{sidebar}</div>
          </aside>

          <div className="space-y-8">
            <MobileSectionsSheet sidebar={sidebar} />

            {hero}

            <article className="space-y-12">{children}</article>

            {related ? <section className="border-t border-border pt-10">{related}</section> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
