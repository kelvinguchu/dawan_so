import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { Locale, FormatDistanceFn } from 'date-fns'

const translations: Record<string, string> = {
  lessThanXSeconds: 'wax ka yar {{count}} ilbiriqsi',
  xSeconds: '{{count}} ilbiriqsi',
  halfAMinute: 'nus daqiiqo',
  lessThanXMinutes: 'wax ka yar {{count}} daqiiqo',
  xMinutes: '{{count}} daqiiqo',
  aboutXHours: 'qiyaastii {{count}} saac',
  xHours: '{{count}} saac',
  xDays: '{{count}} maalmood',
  aboutXWeeks: 'qiyaastii {{count}} toddobaad',
  xWeeks: '{{count}} toddobaad',
  aboutXMonths: 'qiyaastii {{count}} bilood',
  xMonths: '{{count}} bilood',
  aboutXYears: 'qiyaastii {{count}} sano',
  xYears: '{{count}} sano',
  overXYears: 'in ka badan {{count}} sano',
  almostXYears: 'ku dhowaad {{count}} sano',
}

const formatDistance: FormatDistanceFn = (token, count, options) => {
  const translation = translations[token]
  const result = translation ? translation.replace('{{count}}', count.toString()) : ''

  if (options?.addSuffix) {
    if ((options.comparison || 0) > 0) {
      return 'mustaqbalka ' + result
    } else {
      return result + ' kahor'
    }
  }

  return result
}

const soLocale: Locale = {
  ...enUS,
  code: 'so',
  formatDistance: formatDistance,
}

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      console.warn('Invalid dateString provided to formatTimeAgo:', dateString)
      return 'Invalid date'
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: soLocale })
  } catch (error) {
    console.error('Error in formatTimeAgo:', error)
    return 'Date unavailable'
  }
}
