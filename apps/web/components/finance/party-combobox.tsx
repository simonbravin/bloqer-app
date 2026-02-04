'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronDown, X } from 'lucide-react'

interface Party { id: string; name: string }

interface PartyComboboxProps {
  label: string
  placeholder: string
  parties: Party[]
  value: string | null
  onChange: (id: string | null) => void
  disabled?: boolean
  id?: string
}

export function PartyCombobox({
  label,
  placeholder,
  parties,
  value,
  onChange,
  disabled,
  id = 'partyId',
}: PartyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = parties.find((p) => p.id === value)
  const filtered = search.trim()
    ? parties.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase().trim())
      )
    : parties

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Input
            id={id}
            value={open ? search : (selected?.name ?? '')}
            onChange={(e) => {
              setSearch(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : placeholder}
            disabled={disabled}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none"
          />
          <div className="flex items-center border-l">
            {value ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-2 hover:bg-muted rounded-r-md"
                aria-label="Limpiar"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="p-2 hover:bg-muted rounded-r-md"
                aria-label="Abrir lista"
              >
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground', open && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>
        {open && (
          <ul
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
            role="listbox"
          >
            <li
              role="option"
              className="relative cursor-pointer select-none px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(null)
                setOpen(false)
              }}
            >
              — Ninguno
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</li>
            ) : (
              filtered.map((p) => (
                <li
                  key={p.id}
                  role="option"
                  className={cn(
                    'relative cursor-pointer select-none px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted',
                    value === p.id && 'bg-muted'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange(p.id)
                    setOpen(false)
                  }}
                >
                  {p.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
