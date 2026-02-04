'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Play, Save } from 'lucide-react'
import { getAvailableTables, executeCustomQuery } from '@/app/actions/reports'
import type { TableMetadata, QueryConfig, QueryFilter } from '@/lib/types/reports'
import { toast } from 'sonner'

const OPERATORS: { value: QueryFilter['operator']; label: string }[] = [
  { value: '=', label: '=' },
  { value: '!=', label: '!=' },
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: 'CONTAINS', label: 'Contiene' },
]

export function QueryBuilder() {
  const [tables, setTables] = useState<TableMetadata[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [filters, setFilters] = useState<QueryFilter[]>([])
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getAvailableTables().then(setTables)
  }, [])

  const currentTable = tables.find((t) => t.name === selectedTable)
  const availableFields = currentTable?.fields ?? []

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        id: crypto.randomUUID(),
        field: '',
        operator: '=',
        value: '',
      },
    ])
  }

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id))
  }

  const handleRunQuery = async () => {
    if (!selectedTable || selectedFields.length === 0) {
      toast.error('Selecciona tabla y al menos un campo')
      return
    }
    setIsLoading(true)
    try {
      const config: QueryConfig = {
        table: selectedTable,
        select: selectedFields,
        where: filters.filter((f) => f.field && f.value !== undefined && String(f.value).trim() !== ''),
      }
      const result = await executeCustomQuery(config)
      setPreviewData(result.data)
      toast.success(`${result.totalRows} registros en ${result.executionTime}ms`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al ejecutar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Seleccionar Tabla Base</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTable} onValueChange={(v) => { setSelectedTable(v); setSelectedFields([]); setPreviewData([]) }}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Elige una tabla" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.name} value={table.name}>
                  {table.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>2. Seleccionar Campos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableFields.map((field) => (
                <Badge
                  key={field.field}
                  variant={selectedFields.includes(field.field) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedFields.includes(field.field)) {
                      setSelectedFields(selectedFields.filter((f) => f !== field.field))
                    } else {
                      setSelectedFields([...selectedFields, field.field])
                    }
                  }}
                >
                  {field.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTable && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>3. Filtros (opcional)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddFilter}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Filtro
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {filters.map((filter) => (
              <div key={filter.id} className="flex flex-wrap items-end gap-2 rounded border p-2">
                <div className="min-w-[140px] space-y-1">
                  <Label className="text-xs">Campo</Label>
                  <Select
                    value={filter.field}
                    onValueChange={(value) => {
                      setFilters(filters.map((f) => (f.id === filter.id ? { ...f, field: value } : f)))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field.field} value={field.field}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Operador</Label>
                  <Select
                    value={filter.operator}
                    onValueChange={(value: QueryFilter['operator']) => {
                      setFilters(filters.map((f) => (f.id === filter.id ? { ...f, operator: value } : f)))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[160px] flex-1 space-y-1">
                  <Label className="text-xs">Valor</Label>
                  <Input
                    value={filter.value !== undefined && filter.value !== null ? String(filter.value) : ''}
                    onChange={(e) => {
                      setFilters(filters.map((f) => (f.id === filter.id ? { ...f, value: e.target.value } : f)))
                    }}
                    placeholder="Valor"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(filter.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={handleRunQuery} disabled={isLoading || !selectedTable || selectedFields.length === 0}>
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? 'Ejecutando...' : 'Ejecutar Query'}
        </Button>
        <Button variant="outline" disabled={previewData.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Reporte
        </Button>
      </div>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa ({previewData.length} registros)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 50).map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{value != null ? String(value) : '—'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
