
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TOUCH_DEVICE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTouch, setIsTouch] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Função para detectar dispositivos móveis de forma mais robusta
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileUA = mobileRegex.test(userAgent)
      
      // Verificar largura da tela
      const isScreenMobile = window.innerWidth < MOBILE_BREAKPOINT
      
      // Verificar se é um dispositivo touch
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           (navigator as any).msMaxTouchPoints > 0
      
      // Chrome mobile específico
      const isChromeAndroid = /Chrome/.test(userAgent) && /Android/.test(userAgent)
      const isChromeiOS = /CriOS/.test(userAgent)
      
      console.log('Mobile detection:', {
        userAgent,
        isMobileUA,
        isScreenMobile,
        isTouchDevice,
        isChromeAndroid,
        isChromeiOS,
        innerWidth: window.innerWidth
      })
      
      return isMobileUA || isScreenMobile || isChromeAndroid || isChromeiOS
    }

    const detectTouch = () => {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             (navigator as any).msMaxTouchPoints > 0
    }

    const updateDetection = () => {
      setIsMobile(detectMobile())
      setIsTouch(detectTouch())
    }

    // Detecção inicial
    updateDetection()

    // Listener para mudanças de orientação/tamanho
    const handleResize = () => {
      // Pequeno delay para aguardar a mudança de orientação
      setTimeout(updateDetection, 100)
    }

    const handleOrientationChange = () => {
      // Delay maior para orientação porque Chrome mobile pode demorar
      setTimeout(updateDetection, 300)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Para Chrome mobile - detectar mudanças de viewport
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return { isMobile, isTouch }
}

// Hook para detectar problemas específicos do Chrome mobile
export function useChromeStability() {
  const [isChromeMobile, setIsChromeMobile] = React.useState(false)
  const [hasViewportIssues, setHasViewportIssues] = React.useState(false)

  React.useEffect(() => {
    const userAgent = navigator.userAgent
    const isChrome = /Chrome/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isiOS = /iPhone|iPad|iPod/.test(userAgent)
    const isCriOS = /CriOS/.test(userAgent)
    
    setIsChromeMobile((isChrome && isAndroid) || isCriOS)

    // Detectar problemas de viewport específicos do Chrome mobile
    const checkViewport = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      
      // Chrome mobile pode ter problemas com vh units
      const hasVhIssues = window.innerHeight !== document.documentElement.clientHeight
      setHasViewportIssues(hasVhIssues)
      
      console.log('Viewport check:', { vw, vh, hasVhIssues, innerHeight: window.innerHeight, clientHeight: document.documentElement.clientHeight })
    }

    checkViewport()
    
    const handleViewportChange = () => {
      setTimeout(checkViewport, 100)
    }

    window.addEventListener('resize', handleViewportChange)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleViewportChange)
    }

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
      }
    }
  }, [])

  return { isChromeMobile, hasViewportIssues }
}
