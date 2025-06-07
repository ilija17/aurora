export function extractErrorMessage(err: any, fallback = 'Unexpected error'): string {
  if (err?.data?.statusMessage) return err.data.statusMessage
  if (err?.statusMessage) return err.statusMessage
  if (err?.statusText) return err.statusText
  if (typeof err?.message === 'string') {
    const match = err.message.match(/^[^:]+:\s\d+\s+(.*)$/)
    return match ? match[1] : err.message
  }
  return fallback
}
