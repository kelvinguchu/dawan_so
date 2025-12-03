'use client'

import type { ReactNode } from 'react'
import { List } from 'lucide-react'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface MobileSectionsSheetProps {
  sidebar: ReactNode
}

export function MobileSectionsSheet({ sidebar }: Readonly<MobileSectionsSheetProps>) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="lg:hidden fixed bottom-6 right-6 z-40 gap-2 shadow-lg shadow-black/20 bg-[#b01c14] hover:bg-[#8a1610]"
        >
          <List className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="lg:hidden flex min-h-[75vh] flex-col overflow-hidden rounded-t-xl border-t border-border px-2"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base font-semibold">Browse Sections</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto pb-6 text-sm text-foreground/90">{sidebar}</div>
      </SheetContent>
    </Sheet>
  )
}
