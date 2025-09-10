import { formatDistanceToNow } from 'date-fns'

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '' 

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      console.warn('Invalid dateString provided to formatTimeAgo:', dateString)
      return 'Invalid date'
    }

    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error in formatTimeAgo:', error)
    return 'Date unavailable' 
  }
}
