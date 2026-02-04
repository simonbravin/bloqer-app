'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { addWbsNode } from '@/app/actions/wbs'
import { Loader2, BookOpen, History, Pencil, Package } from 'lucide-react'

interface AddWbsNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  parentId: string | null
  parentCode?: string
  parentName?: string
}

export function AddWbsNodeDialog({
  open,
  onOpenChange,
  projectId,
  parentId,
  parentCode,
  parentName,
}: AddWbsNodeDialogProps) {
  const t = useTranslations('wbs')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [source, setSource] = useState<'template' | 'history' | 'custom'>('template')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const [customName, setCustomName] = useState('')
  const [customUnit, setCustomUnit] = useState('un')
  const [customDescription, setCustomDescription] = useState('')

  const [templates] = useState([
    { id: '1', name: 'Demoliciones', unit: 'm3', hasResources: true },
    { id: '2', name: 'Excavación manual', unit: 'm3', hasResources: true },
    { id: '3', name: 'Excavación mecánica', unit: 'm3', hasResources: true },
    { id: '4', name: 'Rellenos compactados', unit: 'm3', hasResources: false },
  ])

  const [history] = useState([
    { name: 'Limpieza de escombros', unit: 'm2' },
    { name: 'Nivelación de terreno', unit: 'm2' },
  ])

  const units = [
    'un',
    'm',
    'm2',
    'm3',
    'kg',
    'tn',
    'h',
    'día',
    'gl',
    'bolsa',
    'l',
  ]

  const filteredTemplates = templates.filter((tm) =>
    tm.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredHistory = history.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleAdd() {
    if (source === 'template' && !selectedTemplateId) {
      toast.error(t('error'), {
        description: t('selectTemplate'),
      })
      return
    }

    if (source === 'history') {
      toast.error(t('error'), {
        description: t('selectFromHistoryOrCustom'),
      })
      return
    }

    if (source === 'custom' && !customName.trim()) {
      toast.error(t('error'), {
        description: t('enterName'),
      })
      return
    }

    startTransition(async () => {
      try {
        const result = await addWbsNode({
          projectId,
          parentId,
          templateId: source === 'template' ? selectedTemplateId! : undefined,
          customData:
            source === 'custom'
              ? {
                  name: customName.trim(),
                  unit: customUnit,
                  description: customDescription.trim() || undefined,
                }
              : undefined,
        })

        if (result.success) {
          toast.success(t('nodeAdded'), { description: t('nodeAddedDesc') })
          onOpenChange(false)
          router.refresh()
          setSource('template')
          setSelectedTemplateId(null)
          setCustomName('')
          setCustomUnit('un')
          setCustomDescription('')
          setSearchQuery('')
        } else {
          toast.error(t('error'), {
            description: result.error ?? t('addNodeError'),
          })
        }
      } catch {
        toast.error(t('error'), { description: t('addNodeError') })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addNewTask')}</DialogTitle>
          <DialogDescription>
            {parentName != null && parentName !== '' ? (
              <>
                {t('addingUnder')}: <strong>{parentCode}</strong> - {parentName}
              </>
            ) : (
              t('addingAtRoot')
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              placeholder={t('searchTasks')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <RadioGroup value={source} onValueChange={(v) => setSource(v as typeof source)}>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="template" id="template" />
                  <Label htmlFor="template" className="flex cursor-pointer items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{t('fromLibrary')}</span>
                  </Label>
                </div>

                {source === 'template' && (
                  <div className="mt-3 space-y-2 pl-6">
                    {filteredTemplates.length === 0 ? (
                      <p className="text-sm text-slate-500">{t('noTemplatesFound')}</p>
                    ) : (
                      filteredTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                            selectedTemplateId === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-slate-500">
                              {t('unit')}: {template.unit}
                            </p>
                          </div>
                          {template.hasResources && (
                            <Badge variant="secondary" className="text-xs">
                              <Package className="mr-1 h-3 w-3" />
                              Con APU
                            </Badge>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="history" id="history" />
                  <Label htmlFor="history" className="flex cursor-pointer items-center gap-2">
                    <History className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">{t('recentlyUsed')}</span>
                  </Label>
                </div>

                {source === 'history' && (
                  <div className="mt-3 space-y-2 pl-6">
                    {filteredHistory.length === 0 ? (
                      <p className="text-sm text-slate-500">{t('noHistoryFound')}</p>
                    ) : (
                      filteredHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomName(item.name)
                            setCustomUnit(item.unit)
                            setSource('custom')
                          }}
                          className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:border-purple-300 hover:bg-slate-50"
                        >
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {t('unit')}: {item.unit}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex cursor-pointer items-center gap-2">
                    <Pencil className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{t('customTask')}</span>
                  </Label>
                </div>

                {source === 'custom' && (
                  <div className="mt-3 space-y-3 pl-6">
                    <div>
                      <Label htmlFor="customName">{t('name')} *</Label>
                      <Input
                        id="customName"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customUnit">{t('unit')} *</Label>
                      <Select value={customUnit} onValueChange={setCustomUnit}>
                        <SelectTrigger id="customUnit" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customDescription">{t('description')}</Label>
                      <Textarea
                        id="customDescription"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder={t('descriptionPlaceholder')}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button onClick={handleAdd} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('adding')}
              </>
            ) : (
              t('add')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
