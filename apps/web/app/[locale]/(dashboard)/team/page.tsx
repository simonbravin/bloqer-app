import { getTranslations } from 'next-intl/server'

export default async function TeamPage() {
  const t = await getTranslations('nav')
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('team')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona los miembros de tu organización
        </p>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">
          Página en construcción
        </p>
      </div>
    </div>
  )
}
