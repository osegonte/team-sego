export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { error: string }

export function isActionSuccess<T>(result: ActionResult<T>): result is { success: true; data?: T } {
  return 'success' in result && result.success === true
}

export function isActionError<T>(result: ActionResult<T>): result is { error: string } {
  return 'error' in result
}