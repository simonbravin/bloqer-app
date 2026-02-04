import { addDays, isWeekend } from 'date-fns'

/**
 * Verificar si una fecha es día laborable
 * @param date - Fecha a verificar
 * @param workingDaysPerWeek - Días laborables por semana (5, 6 o 7)
 * @returns true si es día laborable
 */
export function isWorkingDay(
  date: Date,
  workingDaysPerWeek: number = 6
): boolean {
  const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado

  if (workingDaysPerWeek === 7) {
    return true
  }
  if (workingDaysPerWeek === 6) {
    return dayOfWeek !== 0
  }
  if (workingDaysPerWeek === 5) {
    return !isWeekend(date)
  }
  return true
}

/**
 * Agregar días laborables a una fecha
 * @param startDate - Fecha de inicio
 * @param days - Cantidad de días laborables a agregar (negativo = restar)
 * @param workingDaysPerWeek - Días laborables por semana (5, 6 o 7)
 * @returns Nueva fecha después de agregar días laborables
 */
export function addWorkingDays(
  startDate: Date,
  days: number,
  workingDaysPerWeek: number = 6
): Date {
  if (days === 0) return new Date(startDate)

  let date = new Date(startDate)
  let daysAdded = 0
  const increment = days > 0 ? 1 : -1
  const targetDays = Math.abs(days)

  while (daysAdded < targetDays) {
    date = addDays(date, increment)
    if (isWorkingDay(date, workingDaysPerWeek)) {
      daysAdded++
    }
  }

  return date
}

/**
 * Calcular días laborables entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @param workingDaysPerWeek - Días laborables por semana
 * @returns Cantidad de días laborables entre las fechas (negativo si startDate > endDate)
 */
export function countWorkingDays(
  startDate: Date,
  endDate: Date,
  workingDaysPerWeek: number = 6
): number {
  if (startDate > endDate) {
    return -countWorkingDays(endDate, startDate, workingDaysPerWeek)
  }

  let count = 0
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, workingDaysPerWeek)) {
      count++
    }
    currentDate = addDays(currentDate, 1)
  }

  return count
}

/**
 * Obtener el siguiente día laborable
 * @param date - Fecha de referencia
 * @param workingDaysPerWeek - Días laborables por semana
 * @returns Siguiente día laborable
 */
export function getNextWorkingDay(
  date: Date,
  workingDaysPerWeek: number = 6
): Date {
  let nextDay = addDays(date, 1)
  while (!isWorkingDay(nextDay, workingDaysPerWeek)) {
    nextDay = addDays(nextDay, 1)
  }
  return nextDay
}

/**
 * Obtener el día laborable anterior
 * @param date - Fecha de referencia
 * @param workingDaysPerWeek - Días laborables por semana
 * @returns Día laborable anterior
 */
export function getPreviousWorkingDay(
  date: Date,
  workingDaysPerWeek: number = 6
): Date {
  let prevDay = addDays(date, -1)
  while (!isWorkingDay(prevDay, workingDaysPerWeek)) {
    prevDay = addDays(prevDay, -1)
  }
  return prevDay
}
