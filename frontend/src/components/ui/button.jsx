"use client"

export const Button = ({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "default",
  style = {},
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center rounded-md text-sm font-medium 
    transition-colors focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 
    disabled:pointer-events-none ring-offset-background cursor-pointer
    border-none outline-none
  `

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
