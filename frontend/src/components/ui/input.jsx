"use client"

export const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  onKeyPress,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles = `
    flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 
    text-sm ring-offset-background file:border-0 file:bg-transparent 
    file:text-sm file:font-medium placeholder:text-muted-foreground 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
    focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
  `

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  )
}
