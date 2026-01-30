export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ModalState {
  isOpen: boolean
  loadingState: LoadingState
  error: string | null
}

export function createModalState(): ModalState {
  return {
    isOpen: false,
    loadingState: 'idle',
    error: null
  }
}

export function isLoading(state: LoadingState): boolean {
  return state === 'loading'
}

export function hasError(state: LoadingState): boolean {
  return state === 'error'
}

export function isSuccess(state: LoadingState): boolean {
  return state === 'success'
}