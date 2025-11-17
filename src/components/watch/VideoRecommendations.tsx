import React from 'react'
import { VideoAsset } from '@/payload-types'
import { VideoCard } from './VideoCard'

interface VideoRecommendationsProps {
  videos: VideoAsset[]
}

export const VideoRecommendations: React.FC<VideoRecommendationsProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <aside className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#b01c14]">Ku xiga</p>
        <h2 className="mt-2 text-lg font-bold text-gray-900">Fiidiyowyada lagu taliyay</h2>
        <p className="mt-3 text-sm text-gray-500">
          Faahfaahin lama hayo weli — marka fiidiyowyo cusub soo baxaan waxaan ku soo bandhigi
          doonnaa halkan.
        </p>
      </aside>
    )
  }

  return (
    <aside className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b01c14]">Ku xiga</p>
          <h2 className="text-lg font-bold text-gray-900">Fiidiyowyada lagu taliyay</h2>
        </div>
        <span className="text-xs text-gray-500">{videos.length} xul</span>
      </div>
      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} variant="list" />
        ))}
      </div>
    </aside>
  )
}
