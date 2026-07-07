import { useId, useState } from 'react'

interface StatusFilterOption<T extends string> {
  value: T
  label: string
}

interface StatusFilterDropdownProps<T extends string> {
  label: string
  value: T
  options: Array<StatusFilterOption<T>>
  onChange: (value: T) => void
}

export function StatusFilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: StatusFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const listboxId = useId()
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  return (
    <div className="status-filter-dropdown" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false)
      }
    }}>
      <span className="status-filter-label">{label}</span>
      <button
        type="button"
        className="status-filter-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption.label}</span>
        <span className="status-filter-arrow" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="status-filter-menu" id={listboxId} role="listbox" tabIndex={-1}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`status-filter-option${option.value === value ? ' selected' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
