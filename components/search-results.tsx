'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProfileCard from '@/components/profile-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Profile = {
  id: string
  name: string
  headline: string
  location?: string
  photo_url?: string
  profile_url: string
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profession = searchParams.get('profession') || ''
  const location = searchParams.get('location') || ''
  const technologies = searchParams.get('technologies') || ''

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (profession) params.set('profession', profession)
        if (location) params.set('location', location)
        if (technologies) params.set('technologies', technologies)
        
        const response = await fetch(`/api/search?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar perfis')
        }
        
        const data = await response.json()
        setProfiles(data.profiles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [profession, location, technologies])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
        <p className="text-center text-muted-foreground">Buscando perfis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          {profiles.length} {profiles.length === 1 ? 'perfil encontrado' : 'perfis encontrados'}
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhum perfil encontrado. Tente ajustar seus filtros de busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
