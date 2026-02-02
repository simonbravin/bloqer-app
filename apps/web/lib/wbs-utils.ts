/**
 * WBS code generation and type hierarchy validation.
 * PHASE (depth 1) → ACTIVITY (depth 2) → TASK (depth 3)
 */

export const MAX_DEPTH = 3

export const WBS_TYPE_HIERARCHY: Record<string, string[]> = {
  PHASE: ['ACTIVITY'],
  ACTIVITY: ['TASK'],
  TASK: [],
} as const

export type WbsType = 'PHASE' | 'ACTIVITY' | 'TASK'

/**
 * Generate WBS code for a new child: parentCode + "." + sequence
 * Root: "1", "2", "3" ...
 */
export function generateWBSCode(parentCode: string | null, sequence: number): string {
  if (parentCode == null || parentCode === '') return String(sequence)
  return `${parentCode}.${sequence}`
}

/**
 * Allowed child type for a given parent type.
 * PHASE → only ACTIVITY; ACTIVITY → only TASK; TASK → none.
 */
export function getAllowedChildTypes(parentType: WbsType): WbsType[] {
  const allowed = WBS_TYPE_HIERARCHY[parentType]
  return allowed ? (allowed as WbsType[]) : []
}

/**
 * Validate that a child type is allowed under the given parent type.
 */
export function isAllowedChildType(parentType: WbsType, childType: WbsType): boolean {
  const allowed = getAllowedChildTypes(parentType)
  return allowed.includes(childType)
}

/**
 * Depth from type: PHASE=1, ACTIVITY=2, TASK=3.
 */
export function depthOfType(type: WbsType): number {
  const map: Record<WbsType, number> = { PHASE: 1, ACTIVITY: 2, TASK: 3 }
  return map[type] ?? 0
}

/**
 * Parse depth from WBS code (number of segments).
 * e.g. "1" -> 1, "1.2" -> 2, "1.2.3" -> 3
 */
export function depthOfCode(code: string): number {
  if (!code.trim()) return 0
  return code.split('.').length
}
