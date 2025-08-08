import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./button"

export interface ButtonWithLoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Indica se o botão está em estado de carregamento
   */
  isLoading?: boolean
  /**
   * Texto a ser exibido durante o carregamento
   * Se não fornecido, usará o children
   */
  loadingText?: string
  /**
   * Ícone a ser exibido durante o carregamento
   * @default Loader2 (ícone de carregamento padrão)
   */
  loadingIcon?: React.ReactNode
  /**
   * Ícone a ser exibido antes do texto
   */
  startIcon?: React.ReactNode
  /**
   * Ícone a ser exibido depois do texto
   */
  endIcon?: React.ReactNode
  /**
   * Se verdadeiro, o botão ocupará toda a largura do container
   */
  fullWidth?: boolean
}

/**
 * Um componente de botão aprimorado com suporte a estados de carregamento
 */
const ButtonWithLoading = React.forwardRef<HTMLButtonElement, ButtonWithLoadingProps>(
  ({
    className,
    variant,
    size,
    isLoading = false,
    loadingText,
    loadingIcon = <Loader2 className="h-4 w-4 animate-spin" />,
    startIcon,
    endIcon,
    children,
    disabled,
    fullWidth = false,
    ...props
  }, ref) => {
    const showStartIcon = !isLoading && startIcon
    const showEndIcon = !isLoading && endIcon
    const buttonContent = isLoading ? (loadingText || children) : children

    return (
      <Button
        className={cn(
          'transition-all',
          fullWidth && 'w-full',
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && loadingIcon && (
          <span className="mr-2">
            {loadingIcon}
          </span>
        )}
        
        {showStartIcon && (
          <span className="mr-2">
            {startIcon}
          </span>
        )}
        
        {buttonContent}
        
        {showEndIcon && (
          <span className="ml-2">
            {endIcon}
          </span>
        )}
      </Button>
    )
  }
)

ButtonWithLoading.displayName = "ButtonWithLoading"

export { ButtonWithLoading }
