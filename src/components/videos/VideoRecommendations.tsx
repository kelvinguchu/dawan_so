import React from 'react'
import { HeadlineVideo } from '@/payload-types'
import { VideoCard } from './VideoCard'

interface VideoRecommendationsProps {
  videos: HeadlineVideo[]
}

export const VideoRecommendations: React.FC<VideoRecommendationsProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">Faahfaahin lama hayo weli.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} variant="list" />
        ))}
      </div>
    </div>
  )
}
