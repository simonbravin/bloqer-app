/**
 * Resource code generation: {CATEGORY_PREFIX}-{SEQUENCE}
 * MAT-001, LAB-042, EQP-015, SUB-001, OTH-001
 */
const CATEGORY_PREFIX: Record<string, string> = {
  MATERIAL: 'MAT',
  LABOR: 'LAB',
  EQUIPMENT: 'EQP',
  SUBCONTRACT: 'SUB',
  OTHER: 'OTH',
}

export function generateResourceCode(category: string, sequence: number): string {
  const prefix = CATEGORY_PREFIX[category] ?? 'OTH'
  return `${prefix}-${sequence.toString().padStart(3, '0')}`
}

/** Default unit suggestions by category */
export const DEFAULT_UNITS_BY_CATEGORY: Record<string, string> = {
  MATERIAL: 'ea',
  LABOR: 'hr',
  EQUIPMENT: 'day',
  SUBCONTRACT: 'ea',
  OTHER: 'ea',
}

export function getDefaultUnitForCategory(category: string): string {
  return DEFAULT_UNITS_BY_CATEGORY[category] ?? 'ea'
}
