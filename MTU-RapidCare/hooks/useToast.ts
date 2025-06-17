import * as React from "react"
import Toast from 'react-native-toast-message'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  type?: ToastType
  text1?: string
  text2?: string
  position?: 'top' | 'bottom'
  visibilityTime?: number
  autoHide?: boolean
  topOffset?: number
  bottomOffset?: number
  onShow?: () => void
  onHide?: () => void
  onPress?: () => void
}

function useToast() {
  const show = React.useCallback((options: ToastOptions) => {
    Toast.show({
      type: options.type || 'info',
      text1: options.text1,
      text2: options.text2,
      position: options.position || 'top',
      visibilityTime: options.visibilityTime || 4000,
      autoHide: options.autoHide ?? true,
      topOffset: options.topOffset || 40,
      bottomOffset: options.bottomOffset || 40,
      onShow: options.onShow,
      onHide: options.onHide,
      onPress: options.onPress,
    })
  }, [])

  const hide = React.useCallback(() => {
    Toast.hide()
  }, [])

  return {
    show,
    hide,
  }
}

export { useToast }
export type { ToastOptions, ToastType }
