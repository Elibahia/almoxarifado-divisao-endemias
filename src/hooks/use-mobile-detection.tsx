
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TOUCH_DEVICE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTouch, setIsTouch] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Função para detectar dispositivos móveis de forma mais robusta
    const detectMobile = () => {
      try {
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
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
        const isFirefoxMobile = /Firefox/.test(userAgent) && isMobileUA
        
        console.log('Mobile detection:', {
          userAgent,
          isMobileUA,
          isScreenMobile,
          isTouchDevice,
          isChromeAndroid,
          isChromeiOS,
          isSafari,
          isFirefoxMobile,
          innerWidth: window.innerWidth
        })
        
        return isMobileUA || isScreenMobile || isChromeAndroid || isChromeiOS
      } catch (error) {
        console.error('Error detecting mobile:', error)
        return window.innerWidth < MOBILE_BREAKPOINT
      }
    }

    const detectTouch = () => {
      try {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               (navigator as any).msMaxTouchPoints > 0
      } catch (error) {
        console.error('Error detecting touch:', error)
        return false
      }
    }

    const updateDetection = () => {
      try {
        setIsMobile(detectMobile())
        setIsTouch(detectTouch())
      } catch (error) {
        console.error('Error updating detection:', error)
      }
    }

    // Detecção inicial com delay para garantir que o DOM esteja pronto
    const initialTimeout = setTimeout(updateDetection, 100)

    const handleResize = () => {
      // Pequeno delay para aguardar a mudança de orientação
      clearTimeout(initialTimeout)
      setTimeout(updateDetection, 150)
    }

    const handleOrientationChange = () => {
      // Delay maior para orientação porque browsers mobile podem demorar
      setTimeout(updateDetection, 500)
    }

    // Event listeners
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true })

    // Para Chrome mobile - detectar mudanças de viewport
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true })
    }

    // Listener para mudanças de foco da página
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(updateDetection, 200)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })

    return () => {
      clearTimeout(initialTimeout)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return { isMobile, isTouch }
}

// Hook para detectar problemas específicos do Chrome mobile
export function useChromeStability() {
  const [isChromeMobile, setIsChromeMobile] = React.useState(false)
  const [hasViewportIssues, setHasViewportIssues] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    try {
      const userAgent = navigator.userAgent
      const isChrome = /Chrome/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const isiOS = /iPhone|iPad|iPod/.test(userAgent)
      const isCriOS = /CriOS/.test(userAgent)
      const isEdge = /Edg/.test(userAgent)
      
      setIsChromeMobile((isChrome && isAndroid) || isCriOS || isEdge)
      
      // Detectar se está em modo standalone (PWA)
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://')
      
      setIsStandalone(standalone)

      // Detectar problemas de viewport específicos do Chrome mobile
      const checkViewport = () => {
        try {
          const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
          const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
          
          // Chrome mobile pode ter problemas com vh units
          const heightDiff = Math.abs(window.innerHeight - document.documentElement.clientHeight)
          const hasVhIssues = heightDiff > 100 // Tolerância de 100px
          
          setHasViewportIssues(hasVhIssues)
          
          console.log('Viewport check:', { 
            vw, 
            vh, 
            hasVhIssues, 
            heightDiff,
            innerHeight: window.innerHeight, 
            clientHeight: document.documentElement.clientHeight,
            isStandalone: standalone
          })
        } catch (error) {
          console.error('Error checking viewport:', error)
        }
      }

      checkViewport()
      
      const handleViewportChange = () => {
        setTimeout(checkViewport, 200)
      }

      window.addEventListener('resize', handleViewportChange, { passive: true })
      
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange, { passive: true })
      }

      return () => {
        window.removeEventListener('resize', handleViewportChange)
        if ('visualViewport' in window && window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleViewportChange)
        }
      }
    } catch (error) {
      console.error('Error in Chrome stability hook:', error)
    }
  }, [])

  return { isChromeMobile, hasViewportIssues, isStandalone }
}

// Hook para PWA
export function usePWAStability() {
  const [isPWA, setIsPWA] = React.useState(false)
  const [installPromptAvailable, setInstallPromptAvailable] = React.useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    // Detectar se está rodando como PWA
    const checkPWA = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://')
      setIsPWA(standalone)
    }

    checkPWA()

    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptAvailable(true)
    }

    // Listener para updates do service worker
    const handleSWUpdate = () => {
      setSwUpdateAvailable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Verificar se há service worker ativo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate)
      }
    }
  }, [])

  return { isPWA, installPromptAvailable, swUpdateAvailable }
}
