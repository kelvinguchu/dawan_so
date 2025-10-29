'use client'

import React, { useEffect, useMemo, useState } from 'react'

interface AuthorCellProps {
  rowData?: Record<string, unknown>
}

const extractUserCandidate = (authorValue: unknown): unknown => {
  if (Array.isArray(authorValue)) {
    return authorValue[0]
  }

  return authorValue
}

const coerceToString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    for (const key of Object.keys(record)) {
      const potential = coerceToString(record[key])

      if (potential) {
        return potential
      }
    }
  }

  return null
}

const extractAuthorId = (authorValue: unknown): string | null => {
  const candidate = extractUserCandidate(authorValue)

  if (!candidate) {
    return null
  }

  if (typeof candidate === 'string') {
    return candidate
  }

  if (typeof candidate === 'object') {
    const candidateWithId = candidate as { id?: unknown; _id?: unknown }

    const idValue = coerceToString(candidateWithId.id)

    if (idValue) {
      return idValue
    }

    const legacyId = coerceToString(candidateWithId._id)

    if (legacyId) {
      return legacyId
    }
  }

  return null
}

const extractAuthorName = (authorValue: unknown): string | null => {
  const candidate = extractUserCandidate(authorValue)

  if (!candidate || typeof candidate !== 'object') {
    return coerceToString(candidate)
  }

  const candidateWithName = candidate as {
    name?: unknown
    fullName?: unknown
    email?: unknown
  }

  return (
    coerceToString(candidateWithName.name) ||
    coerceToString(candidateWithName.fullName) ||
    coerceToString(candidateWithName.email)
  )
}

const AuthorCell: React.FC<AuthorCellProps> = ({ rowData }) => {
  const manualReporterName = useMemo(() => {
    if (!rowData?.useManualReporter) {
      return null
    }

    const manualReporter = rowData.manualReporter as { name?: unknown } | undefined

    return coerceToString(manualReporter?.name)
  }, [rowData])

  const initialAuthorName = useMemo(() => {
    if (manualReporterName) {
      return manualReporterName
    }

    return extractAuthorName(rowData?.author)
  }, [manualReporterName, rowData?.author])

  const [resolvedName, setResolvedName] = useState<string | null>(initialAuthorName)

  useEffect(() => {
    setResolvedName(initialAuthorName)
  }, [initialAuthorName])

  useEffect(() => {
    if (resolvedName || manualReporterName) {
      return
    }

    const authorId = extractAuthorId(rowData?.author)

    if (!authorId) {
      return
    }

    const abortController = new AbortController()

    const fetchAuthor = async () => {
      try {
        const response = await fetch(`/api/users/${authorId}`, {
          credentials: 'include',
          signal: abortController.signal,
        })

        if (!response.ok) {
          return
        }

        const payloadResponse = (await response.json()) as {
          doc?: { name?: unknown; fullName?: unknown; email?: unknown }
        }

        const fetchedName =
          coerceToString(payloadResponse.doc?.name) ||
          coerceToString(payloadResponse.doc?.fullName) ||
          coerceToString(payloadResponse.doc?.email)

        if (fetchedName) {
          setResolvedName(fetchedName)
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
      }
    }

    void fetchAuthor()

    return () => {
      abortController.abort()
    }
  }, [manualReporterName, resolvedName, rowData?.author])

  if (manualReporterName) {
    return <span>{manualReporterName}</span>
  }

  if (resolvedName) {
    return <span>{resolvedName}</span>
  }

  return <span>No Author</span>
}

export default AuthorCell
