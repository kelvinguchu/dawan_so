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

const gatherCandidateObjects = (value: unknown): Array<Record<string, unknown>> => {
  const results: Array<Record<string, unknown>> = []
  const queue: unknown[] = [value]
  const seen = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue
    }

    seen.add(current)

    const record = current as Record<string, unknown>
    results.push(record)

    if ('value' in record) {
      queue.push(record.value)
    }

    if ('data' in record) {
      queue.push(record.data)
    }
  }

  return results
}

const coerceString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return null
}

const extractAuthorId = (authorValue: unknown): string | null => {
  const candidate = extractUserCandidate(authorValue)

  const directId = coerceString(candidate)

  if (directId) {
    return directId
  }

  const candidateObjects = gatherCandidateObjects(candidate)

  for (const objectCandidate of candidateObjects) {
    const id =
      coerceString(objectCandidate.id) ||
      coerceString(objectCandidate._id) ||
      coerceString(objectCandidate.value)

    if (id) {
      return id
    }
  }

  return null
}

const readAuthorName = (source: unknown): string | null => {
  if (!source || typeof source !== 'object') {
    return null
  }

  const candidate = source as {
    name?: unknown
    fullName?: unknown
    email?: unknown
  }

  const name = coerceString(candidate.name)

  if (name) {
    return name
  }

  const fullName = coerceString(candidate.fullName)

  if (fullName) {
    return fullName
  }

  return coerceString(candidate.email)
}

const extractAuthorName = (authorValue: unknown): string | null => {
  const candidate = extractUserCandidate(authorValue)

  const directName = readAuthorName(candidate)

  if (directName) {
    return directName
  }

  const candidateObjects = gatherCandidateObjects(candidate)

  for (const objectCandidate of candidateObjects) {
    const name = readAuthorName(objectCandidate)

    if (name) {
      return name
    }
  }

  return null
}

const AuthorCell: React.FC<AuthorCellProps> = ({ rowData }) => {
  const manualReporterName = useMemo(() => {
    if (!rowData?.useManualReporter) {
      return null
    }

    const manualReporter = rowData.manualReporter as { name?: unknown } | undefined

    if (typeof manualReporter?.name === 'string' && manualReporter.name.trim().length > 0) {
      return manualReporter.name.trim()
    }

    return null
  }, [rowData])

  const initialAuthorName = useMemo(() => {
    if (manualReporterName) {
      return manualReporterName
    }

    return extractAuthorName(rowData?.author)
  }, [manualReporterName, rowData])

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

        const payloadJson = (await response.json()) as
          | {
              doc?: { name?: string; fullName?: string; email?: string }
            }
          | { name?: string; fullName?: string; email?: string }
          | null
          | undefined

        let authorDoc: { name?: string; fullName?: string; email?: string } | null = null

        if (payloadJson && typeof payloadJson === 'object') {
          if ('doc' in payloadJson && payloadJson.doc && typeof payloadJson.doc === 'object') {
            authorDoc = payloadJson.doc
          } else {
            authorDoc = payloadJson as {
              name?: string
              fullName?: string
              email?: string
            }
          }
        }

        const fetchedName = authorDoc?.name || authorDoc?.fullName || authorDoc?.email || null

        if (fetchedName) {
          setResolvedName(fetchedName)
          return
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
