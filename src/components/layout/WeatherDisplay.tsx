'use client'

import React, { useState, useEffect } from 'react'
import {
  BiCloud,
  BiCloudDrizzle,
  BiCloudLightning,
  BiCloudRain,
  BiCloudSnow,
  BiWind,
  BiMapPin,
  BiSun,
} from 'react-icons/bi'
import { Skeleton } from '@/components/ui/skeleton'

interface WeatherData {
  temperature: number
  windSpeed: number
  weatherCode: number
  location: string
  loading: boolean
  error: boolean
}

interface Coordinates {
  latitude: number
  longitude: number
}

interface WeatherDisplayProps {
  isMobile?: boolean
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ isMobile = false }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    windSpeed: 0,
    weatherCode: 0,
    location: '',
    loading: true,
    error: false,
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {
          setCoordinates({
            latitude: 2.0469,
            longitude: 45.3182,
          })
        },
      )
    } else {
      setCoordinates({
        latitude: 2.0469,
        longitude: 45.3182,
      })
    }
  }, [])

  useEffect(() => {
    if (!coordinates) return

    const getLocationName = async () => {
      try {
        const response = await fetch(
          `/api/geocode/reverse?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
        )

        if (!response.ok) throw new Error('Geocoding failed')

        const data = await response.json()

        const locationName =
          data.address?.city ??
          data.address?.town ??
          data.address?.state ??
          data.address?.country ??
          'Lama yaqaan'

        setWeather((prev) => ({
          ...prev,
          location: locationName,
        }))
      } catch (error) {
        console.error('Error getting location name:', error)
      }
    }

    getLocationName()
  }, [coordinates])

  useEffect(() => {
    if (!coordinates) return

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
        )

        if (!response.ok) {
          throw new Error('Weather data fetch failed')
        }

        const data = await response.json()

        setWeather((prev) => ({
          ...prev,
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          loading: false,
          error: false,
        }))
      } catch (error) {
        console.error('Error fetching weather data:', error)
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: true,
        }))
      }
    }

    fetchWeatherData()
  }, [coordinates])

  const getWeatherIcon = (code: number) => {
    const iconProps = isMobile
      ? { className: 'mr-1.5 h-4 w-4' }
      : { className: 'mr-1.5 h-3.5 w-3.5' }
    if (code === 0) return <BiSun {...iconProps} color="text-amber-500" />
    if (code >= 1 && code <= 3) return <BiCloud {...iconProps} color="text-gray-400" />
    if (code >= 45 && code <= 48) return <BiCloud {...iconProps} color="text-gray-400" />
    if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65))
      return <BiCloudRain {...iconProps} color="text-blue-400" />
    if (code >= 56 && code <= 57) return <BiCloudDrizzle {...iconProps} color="text-blue-300" />
    if (code >= 71 && code <= 77) return <BiCloudSnow {...iconProps} color="text-blue-100" />
    if (code >= 80 && code <= 82) return <BiCloudRain {...iconProps} color="text-blue-500" />
    if (code >= 85 && code <= 86) return <BiCloudSnow {...iconProps} color="text-blue-200" />
    if (code >= 95 && code <= 99) return <BiCloudLightning {...iconProps} color="text-yellow-500" />

    return <BiCloud {...iconProps} />
  }

  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Cir furan'
    if (code === 1) return 'Inta badan cir furan'
    if (code === 2) return 'Daruuro qayb ah'
    if (code === 3) return 'Daruuro'
    if (code >= 45 && code <= 48) return 'Ceeryaamo'
    if (code >= 51 && code <= 55) return 'Roob yar'
    if (code >= 56 && code <= 57) return 'Roob yar oo barafoobay'
    if (code >= 61 && code <= 65) return 'Roob'
    if (code >= 66 && code <= 67) return 'Roob barafoobay'
    if (code >= 71 && code <= 77) return 'Baraf'
    if (code >= 80 && code <= 82) return 'Roob dhicis'
    if (code >= 85 && code <= 86) return 'Baraf dhicis'
    if (code >= 95 && code <= 99) return 'Roob duufaan leh'

    return 'Lama yaqaan'
  }

  if (isMobile) {
    return (
      <div className="flex items-center text-xs text-gray-500">
        {weather.loading ? (
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-1.5 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : weather.error ? (
          <span className="flex items-center">
            <BiCloud className="mr-1.5 h-4 w-4" />
            Cimilada lama heli karo
          </span>
        ) : (
          <div className="flex items-center flex-wrap">
            {getWeatherIcon(weather.weatherCode)}
            <span>{Math.round(weather.temperature)}°C</span>
            <span className="mx-1 text-gray-400">•</span>
            <span>{getWeatherCondition(weather.weatherCode)}</span>
            <div className="w-full h-1 md:hidden"></div>
            <BiWind className="mr-1.5 h-4 w-4 text-gray-400" />
            <span>{Math.round(weather.windSpeed)} km/h</span>
            {weather.location && (
              <>
                <span className="mx-1 text-gray-400">•</span>
                <BiMapPin className="mr-1 h-3.5 w-3.5 text-gray-400" />
                <span className="truncate max-w-[100px]">{weather.location}</span>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center text-xs text-gray-500">
      {weather.loading ? (
        <div className="flex items-center">
          <Skeleton className="h-3.5 w-3.5 mr-1.5 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ) : weather.error ? (
        <span className="flex items-center">
          <BiCloud className="mr-1.5 h-3.5 w-3.5" />
          Cimilada lama heli karo
        </span>
      ) : (
        <div className="flex items-center">
          {getWeatherIcon(weather.weatherCode)}
          <span>{Math.round(weather.temperature)}°C</span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="hidden md:inline">{getWeatherCondition(weather.weatherCode)}</span>
          <BiWind className="mx-1.5 h-3.5 w-3.5 text-gray-400 hidden md:inline-block" />
          <span className="hidden md:inline">{Math.round(weather.windSpeed)} km/h</span>
          {weather.location && (
            <>
              <BiMapPin className="mx-1.5 h-3 w-3 text-gray-400 hidden md:inline-block" />
              <span className="hidden md:inline">{weather.location}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default WeatherDisplay
