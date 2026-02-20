'use client'

import { useState, useEffect, useRef } from 'react'

interface AnimNumProps {
  /** Target value to count up to */
  value: number
  /** Prefix (e.g. "$") */
  prefix?: string
  /** Suffix (e.g. "%") */
  suffix?: string
  /** Duration in ms */
  duration?: number
  /** Locale for number formatting (default: undefined = browser default) */
  locale?: string
  /** Optional className for the wrapper span */
  className?: string
}

/**
 * Animated number: counts from 0 (or previous value) to `value` with ease-out cubic.
 * Use for KPIs and dashboard stats.
 */
export function AnimNum({ value, prefix = '', suffix = '', duration = 1200, locale, className }: AnimNumProps) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) {
        raf.current = requestAnimationFrame(tick)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  const formatted = locale ? display.toLocaleString(locale) : display.toLocaleString()
  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
