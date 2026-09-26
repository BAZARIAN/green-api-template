import { HTMLInputAutoCompleteAttribute, useId } from "react";

export function SettingsField({
  label,
  value,
  placeholder,
  onChange,
  autoComplete = "off",
  type = 'text',
  inputMode,
  maxLength,
}: {
  label?: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  autoComplete?: HTMLInputAutoCompleteAttribute
  type?: 'text' | 'password'
  inputMode?: 'numeric' | 'url'
  maxLength?: number
}) {
  const id = useId();

  return (
    <label className="settings-field">
      {label}
      <input
        className="form-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        id={id}
      />
    </label>
  )
}
