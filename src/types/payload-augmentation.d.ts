declare module '@/payload-types' {
  interface User {
    verificationEmailRequests?:
      | {
          id?: string
          sentAt?: string
          context?: string | null
        }[]
      | null
  }
}
