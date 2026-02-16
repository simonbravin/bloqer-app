'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLocalSupplier } from '@/app/actions/global-suppliers'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  taxId: z.string().max(50).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  website: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        if (/^https?:\/\//i.test(val)) {
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        }
        return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z0-9.-]+$/i.test(val.trim())
      },
      { message: 'Ingrese una URL o un dominio (ej: ejemplo.com)' }
    ),
})
type FormData = z.infer<typeof schema>

export function LocalSupplierForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      const result = await createLocalSupplier({
        name: data.name,
        taxId: data.taxId || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        website: data.website || undefined,
      })
      if ('partyId' in result) {
        router.push('/suppliers')
        router.refresh()
      }
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create supplier',
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="erp-form-page space-y-4"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} className="mt-1" required />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="taxId">Tax ID</Label>
        <Input id="taxId" {...register('taxId')} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" type="text" {...register('website')} className="mt-1" placeholder="ejemplo.com" />
      </div>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create supplier'}
        </Button>
        <Link href="/suppliers/list?tab=local">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
