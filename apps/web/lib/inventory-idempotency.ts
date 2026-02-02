export function generateMovementIdempotencyKey(
  itemId: string,
  movementType: string,
  quantity: number,
  timestamp: number = Date.now()
): string {
  return `inv_${itemId}_${movementType}_${quantity}_${timestamp}`
}
