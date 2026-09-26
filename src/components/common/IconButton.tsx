import { Icon, type IconName } from './Icon'
import { cn } from '../../hooks/cn'

export function IconButton({
  label,
  icon,
  onClick,
  disabled,
  className,
  type = "button",
  red,
}: {
  label?: string
  icon: IconName
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: "submit" | "reset" | "button"
  red?: boolean
}) {
  return (
    <button 
      className={cn("icon-button", className, {"red": red})} 
      type={type} 
      aria-label={label} 
      title={label} 
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} size={24} />
    </button>
  )
}
