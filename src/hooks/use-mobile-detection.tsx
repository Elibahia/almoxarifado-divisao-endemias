
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TOUCH_DEVICE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTouch, setIsTouch] = React.useState<boolean>(false)

  React.useEffect(() => {
    const detectMobile = () => {
      try {
        if (!window || !navigator) {
          console.warn('Window or navigator not available');
          return false;
        }

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        const isMobileUA = mobileRegex.test(userAgent)
        
        const isScreenMobile = window.innerWidth < MOBILE_BREAKPOINT
        
        const isTouchDevice = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             (navigator as any).msMaxTouchPoints > 0
        
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
        return window?.innerWidth ? window.innerWidth < MOBILE_BREAKPOINT : false
      }
    }

    const detectTouch = () => {
      try {
        if (!window || !navigator) {
          return false;
        }
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

    const initialTimeout = setTimeout(updateDetection, 100)

    const handleResize = () => {
      try {
        clearTimeout(initialTimeout)
        setTimeout(updateDetection, 150)
      } catch (error) {
        console.error('Error handling resize:', error)
      }
    }

    const handleOrientationChange = () => {
      try {
        setTimeout(updateDetection, 500)
      } catch (error) {
        console.error('Error handling orientation change:', error)
      }
    }

    const handleVisibilityChange = () => {
      try {
        if (!document.hidden) {
          setTimeout(updateDetection, 200)
        }
      } catch (error) {
        console.error('Error handling visibility change:', error)
      }
    }

    try {
      window.addEventListener('resize', handleResize, { passive: true })
      window.addEventListener('orientationchange', handleOrientationChange, { passive: true })
      document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })

      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize, { passive: true })
      }

      return () => {
        clearTimeout(initialTimeout)
        try {
          window.removeEventListener('resize', handleResize)
          window.removeEventListener('orientationchange', handleOrientationChange)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          
          if ('visualViewport' in window && window.visualViewport) {
            window.visualViewport.removeEventListener('resize', handleResize)
          }
        } catch (error) {
          console.error('Error removing event listeners:', error)
        }
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error)
      return () => {}
    }
  }, [])

  return { isMobile, isTouch }
}

export function useChromeStability() {
  const [isChromeMobile, setIsChromeMobile] = React.useState(false)
  const [hasViewportIssues, setHasViewportIssues] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(false)

  React.useEffect(() => {
    try {
      if (!navigator || !window) {
        console.warn('Navigator or window not available for Chrome stability check');
        return;
      }

      const userAgent = navigator.userAgent || ''
      const isChrome = /Chrome/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const isiOS = /iPhone|iPad|iPod/.test(userAgent)
      const isCriOS = /CriOS/.test(userAgent)
      const isEdge = /Edg/.test(userAgent)
      
      setIsChromeMobile((isChrome && isAndroid) || isCriOS || isEdge)
      
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://')
      
      setIsStandalone(standalone)

      const checkViewport = () => {
        try {
          if (!window || !document) {
            return;
          }

          const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
          const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
          
          const heightDiff = Math.abs(window.innerHeight - document.documentElement.clientHeight)
          const hasVhIssues = heightDiff > 100
          
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
        try {
          window.removeEventListener('resize', handleViewportChange)
          if ('visualViewport' in window && window.visualViewport) {
            window.visualViewport.removeEventListener('resize', handleViewportChange)
          }
        } catch (error) {
          console.error('Error cleaning up viewport listeners:', error)
        }
      }
    } catch (error) {
      console.error('Error in Chrome stability hook:', error)
    }
  }, [])

  return { isChromeMobile, hasViewportIssues, isStandalone }
}

export function usePWAStability() {
  const [isPWA, setIsPWA] = React.useState(false)
  const [installPromptAvailable, setInstallPromptAvailable] = React.useState(false)
  const [swUpdateAvailable, setSwUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    try {
      if (!window) {
        console.warn('Window not available for PWA stability check');
        return;
      }

      const checkPWA = () => {
        try {
          const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://')
          setIsPWA(standalone)
        } catch (error) {
          console.error('Error checking PWA status:', error)
        }
      }

      checkPWA()

      const handleBeforeInstallPrompt = (e: Event) => {
        try {
          e.preventDefault()
          setInstallPromptAvailable(true)
        } catch (error) {
          console.error('Error handling install prompt:', error)
        }
      }

      const handleSWUpdate = () => {
        try {
          setSwUpdateAvailable(true)
        } catch (error) {
          console.error('Error handling SW update:', error)
        }
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate)
      }

      return () => {
        try {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate)
          }
        } catch (error) {
          console.error('Error cleaning up PWA listeners:', error)
        }
      }
    } catch (error) {
      console.error('Error in PWA stability hook:', error)
    }
  }, [])

  return { isPWA, installPromptAvailable, swUpdateAvailable }
}
