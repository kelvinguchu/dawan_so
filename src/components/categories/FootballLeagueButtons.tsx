'use client'

import React from 'react'
import FootballSheet from '@/components/football/FootballSheet'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type LeagueId =
  | 'premier-league'
  | 'laliga'
  | 'serie-a'
  | 'bundesliga'
  | 'ligue-1'
  | 'champions-league'
  | 'europa-league'
  | 'saudi-pro-league'
  | 'mls'

type League = { id: LeagueId; name: string }

const leagues: League[] = [
  { id: 'premier-league', name: 'Premier League' },
  { id: 'laliga', name: 'La Liga' },
  { id: 'serie-a', name: 'Serie A' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'ligue-1', name: 'Ligue 1' },
  { id: 'champions-league', name: 'Champions League' },
  { id: 'europa-league', name: 'Europa League' },
  { id: 'saudi-pro-league', name: 'Saudi Pro League' },
  { id: 'mls', name: 'MLS' },
]

const FlagSvg = ({ id, title }: { id: LeagueId; title: string }) => {
  const common = 'w-full h-full'
  switch (id) {
    case 'premier-league':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#fff" />
          <rect x="0" y="1.25" width="4" height="0.5" fill="#cf142b" />
          <rect x="1.75" y="0" width="0.5" height="3" fill="#cf142b" />
        </svg>
      )
    case 'laliga':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#aa151b" />
          <rect x="0" y="0.75" width="4" height="1.5" fill="#f1bf00" />
        </svg>
      )
    case 'serie-a':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#fff" />
          <rect width="1.3333" height="3" x="0" y="0" fill="#008C45" />
          <rect width="1.3333" height="3" x="2.6667" y="0" fill="#CD212A" />
        </svg>
      )
    case 'bundesliga':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#ffce00" />
          <rect width="4" height="1" x="0" y="0" fill="#000" />
          <rect width="4" height="1" x="0" y="2" fill="#dd0000" />
        </svg>
      )
    case 'ligue-1':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#fff" />
          <rect width="1.3333" height="3" x="0" y="0" fill="#0055A4" />
          <rect width="1.3333" height="3" x="2.6667" y="0" fill="#EF4135" />
        </svg>
      )
    case 'champions-league':
    case 'europa-league':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const cx = 2 + Math.cos(angle) * 0.8
            const cy = 1.5 + Math.sin(angle) * 0.6
            return (
              <polygon
                key={i}
                points={`${cx},${cy - 0.12} ${cx + 0.035},${cy - 0.02} ${cx + 0.12},${cy - 0.02} ${cx + 0.05},${cy + 0.03} ${cx + 0.08},${cy + 0.12} ${cx},${cy + 0.07} ${cx - 0.08},${cy + 0.12} ${cx - 0.05},${cy + 0.03} ${cx - 0.12},${cy - 0.02} ${cx - 0.035},${cy - 0.02}`}
                fill="#FFCC00"
              />
            )
          })}
        </svg>
      )
    case 'saudi-pro-league':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#006C35" />
          <rect x="0.8" y="1.8" width="2.4" height="0.12" fill="#fff" />
        </svg>
      )
    case 'mls':
      return (
        <svg viewBox="0 0 4 3" className={common} role="img" aria-label={`${title} flag`}>
          <rect width="4" height="3" fill="#fff" />
          {[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((y) => (
            <rect key={y} x="0" y={y} width="4" height="0.15" fill="#b22234" />
          ))}
          <rect x="0" y="0" width="1.6" height="1.2" fill="#3c3b6e" />
        </svg>
      )
    default:
      return null
  }
}

export const FootballLeagueButtons = () => {
  return (
    <div className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="h-5 w-5 text-amber-600" />
          <span className="font-medium text-gray-900">Horyaallada Kubadda Cagta</span>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2 min-w-max">
            {leagues.map((league) => (
              <FootballSheet key={league.id} defaultCompetition={league.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="group cursor-pointer hover:scale-[1.02] transition-all duration-200 whitespace-nowrap min-w-fit shadow-sm hover:shadow-md rounded-xl border-gray-200 bg-white gap-1"
                  title={league.name}
                >
                  <span className="inline-flex w-5 h-4 shrink-0 rounded-[3px] overflow-hidden bg-gray-50">
                    <FlagSvg id={league.id} title={league.name} />
                  </span>
                  <span className="font-medium text-gray-900">{league.name}</span>
                </Button>
              </FootballSheet>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
