'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format-utils'
import { updateMarkupMode, updateGlobalMarkups } from '@/app/actions/budget'
import { Loader2, Info, Save } from 'lucide-react'

interface MarkupConfigurationProps {
  versionId: string
  currentMode: string
  currentMarkups: {
    overheadPct: number
    financialPct: number
    profitPct: number
    taxPct: number
  }
  directCostTotal: number
  canEdit: boolean
}

export function MarkupConfiguration({
  versionId,
  currentMode,
  currentMarkups,
  directCostTotal,
  canEdit,
}: MarkupConfigurationProps) {
  const t = useTranslations('budget')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [mode, setMode] = useState<'SIMPLE' | 'ADVANCED'>(
    currentMode as 'SIMPLE' | 'ADVANCED'
  )
  const [markups, setMarkups] = useState(currentMarkups)
  const [showModeChangeConfirm, setShowModeChangeConfirm] = useState(false)
  const [pendingMode, setPendingMode] = useState<'SIMPLE' | 'ADVANCED' | null>(
    null
  )

  // Calcular totales secuenciales
  const overheadAmount = directCostTotal * (markups.overheadPct / 100)
  const subtotal1 = directCostTotal + overheadAmount

  const financialAmount = subtotal1 * (markups.financialPct / 100)
  const subtotal2 = subtotal1 + financialAmount

  const profitAmount = subtotal2 * (markups.profitPct / 100)
  const subtotal3 = subtotal2 + profitAmount

  const taxAmount = subtotal3 * (markups.taxPct / 100)
  const totalSale = subtotal3 + taxAmount

  function handleModeToggle(newMode: 'SIMPLE' | 'ADVANCED') {
    if (newMode === mode) return

    // Si cambia de ADVANCED a SIMPLE, pedir confirmación
    if (newMode === 'SIMPLE' && mode === 'ADVANCED') {
      setPendingMode(newMode)
      setShowModeChangeConfirm(true)
    } else {
      confirmModeChange(newMode, false)
    }
  }

  function confirmModeChange(
    newMode: 'SIMPLE' | 'ADVANCED',
    applyToAll: boolean
  ) {
    startTransition(async () => {
      try {
        const result = await updateMarkupMode(versionId, newMode, applyToAll)

        if (result.success) {
          setMode(newMode)
          toast.success(
            newMode === 'SIMPLE' ? t('modeSimpleActivated') : t('modeAdvancedActivated')
          )
          router.refresh()
        } else {
          toast.error(result.error || t('modeUpdateError'))
        }
      } catch {
        toast.error(t('modeUpdateError'))
      } finally {
        setShowModeChangeConfirm(false)
        setPendingMode(null)
      }
    })
  }

  function handleSaveMarkups() {
    if (
      markups.overheadPct < 0 ||
      markups.overheadPct > 100 ||
      markups.financialPct < 0 ||
      markups.financialPct > 100 ||
      markups.profitPct < 0 ||
      markups.profitPct > 100 ||
      markups.taxPct < 0 ||
      markups.taxPct > 100
    ) {
      toast.error(t('invalidPercentage'))
      return
    }

    startTransition(async () => {
      try {
        const result = await updateGlobalMarkups(
          versionId,
          markups,
          mode === 'SIMPLE'
        )

        if (result.success) {
          toast.success(t('markupsSavedDesc'))
          router.refresh()
        } else {
          toast.error(result.error || t('markupsSaveError'))
        }
      } catch {
        toast.error(t('markupsSaveError'))
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t('markupConfiguration')}
            </CardTitle>

            {canEdit && (
              <div className="flex items-center gap-2">
                <Label htmlFor="mode-toggle" className="text-sm font-normal">
                  {t('simpleMode')}
                </Label>
                <Switch
                  id="mode-toggle"
                  checked={mode === 'ADVANCED'}
                  onCheckedChange={(checked) =>
                    handleModeToggle(checked ? 'ADVANCED' : 'SIMPLE')
                  }
                  disabled={isPending}
                />
                <Label htmlFor="mode-toggle" className="text-sm font-normal">
                  {t('advancedMode')}
                </Label>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Modo info */}
          <div
            className={`rounded-lg border p-3 ${
              mode === 'SIMPLE'
                ? 'border-blue-200 bg-blue-50'
                : 'border-purple-200 bg-purple-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-blue-600" />
              <div className="text-sm">
                {mode === 'SIMPLE' ? (
                  <>
                    <p className="font-medium text-blue-900">
                      {t('simpleModeTitle')}
                    </p>
                    <p className="mt-1 text-blue-800">{t('simpleModeDesc')}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-purple-900">
                      {t('advancedModeTitle')}
                    </p>
                    <p className="mt-1 text-purple-800">
                      {t('advancedModeDesc')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Markups grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {t('globalMarkupsBase')}
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="overhead" className="text-sm">
                    {t('overhead')}
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="overhead"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={markups.overheadPct}
                      onChange={(e) =>
                        setMarkups({
                          ...markups,
                          overheadPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!canEdit || isPending}
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-slate-600">%</span>
                    <span className="ml-auto font-mono text-sm tabular-nums text-slate-700">
                      {formatCurrency(overheadAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="financial" className="text-sm">
                    {t('financial')}
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="financial"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={markups.financialPct}
                      onChange={(e) =>
                        setMarkups({
                          ...markups,
                          financialPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!canEdit || isPending}
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-slate-600">%</span>
                    <span className="ml-auto font-mono text-sm tabular-nums text-slate-700">
                      {formatCurrency(financialAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profit" className="text-sm">
                    {t('profit')}
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="profit"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={markups.profitPct}
                      onChange={(e) =>
                        setMarkups({
                          ...markups,
                          profitPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!canEdit || isPending}
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-slate-600">%</span>
                    <span className="ml-auto font-mono text-sm tabular-nums text-slate-700">
                      {formatCurrency(profitAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tax" className="text-sm">
                    {t('tax')} (IVA)
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="tax"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={markups.taxPct}
                      onChange={(e) =>
                        setMarkups({
                          ...markups,
                          taxPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!canEdit || isPending}
                      className="w-24 text-right"
                    />
                    <span className="text-sm text-slate-600">%</span>
                    <span className="ml-auto font-mono text-sm tabular-nums text-slate-700">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {canEdit && (
                <Button
                  onClick={handleSaveMarkups}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === 'SIMPLE' ? t('applyToAll') : t('saveGlobals')}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Right: Calculation breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {t('calculationBreakdown')}
              </h3>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t('directCost')}:</span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatCurrency(directCostTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    + {t('overhead')} ({markups.overheadPct}%):
                  </span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(overheadAmount)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-medium">
                  <span className="text-slate-700">{t('subtotal')} 1:</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(subtotal1)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    + {t('financial')} ({markups.financialPct}%):
                  </span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(financialAmount)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-medium">
                  <span className="text-slate-700">{t('subtotal')} 2:</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(subtotal2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    + {t('profit')} ({markups.profitPct}%):
                  </span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(profitAmount)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-medium">
                  <span className="text-slate-700">{t('subtotal')} 3:</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(subtotal3)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    + {t('tax')} ({markups.taxPct}%):
                  </span>
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>

                <div className="flex justify-between border-t-2 border-slate-300 pt-2">
                  <span className="text-base font-bold text-blue-900">
                    {t('totalSale')}:
                  </span>
                  <span className="font-mono text-xl font-bold tabular-nums text-blue-900">
                    {formatCurrency(totalSale)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Change Confirmation */}
      <AlertDialog
        open={showModeChangeConfirm}
        onOpenChange={setShowModeChangeConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmModeChangeTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>{t('confirmModeChangeDesc')}</p>
                <p className="font-semibold text-orange-600">
                  {t('confirmModeChangeWarning')}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingMode && confirmModeChange(pendingMode, true)
              }
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('applyAndContinue')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
