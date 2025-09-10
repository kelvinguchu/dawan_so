'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useNavigationLoading() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)

  const navigateTo = (
    path: string,
    options?: { showLoading?: boolean; targetName?: string | null },
  ) => {
    const { showLoading = true, targetName = null } = options || {}

    if (showLoading) {
      setIsNavigating(true)
      setTargetPath(targetName || path.split('/').pop() || null)

      setTimeout(() => {
        router.push(path)
      }, 100)
    } else {
      router.push(path)
    }
  }

  return {
    isNavigating,
    targetPath,
    navigateTo,
    setIsNavigating,
  }
}
