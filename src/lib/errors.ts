export function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  try {
    return JSON.stringify(err)
  } catch {
    return 'Unknown error'
  }
}
