import { toast as sonnerToast } from "sonner"

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast(message, { description }),
  promise: sonnerToast.promise,
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: sonnerToast.dismiss,
}
