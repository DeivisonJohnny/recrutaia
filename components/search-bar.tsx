'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const [profession, setProfession] = useState('')
  const [location, setLocation] = useState('')
  const [technologies, setTechnologies] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (profession) params.set('profession', profession)
    if (location) params.set('location', location)
    if (technologies) params.set('technologies', technologies)
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="profession" className="text-sm font-light text-muted-foreground">
            Profissão
          </label>
          <Input
            id="profession"
            type="text"
            placeholder="ex: Desenvolvedor"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="bg-card"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-light text-muted-foreground">
            Localização
          </label>
          <Input
            id="location"
            type="text"
            placeholder="ex: São Paulo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-card"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="technologies" className="text-sm font-light text-muted-foreground">
            Tecnologias
          </label>
          <Input
            id="technologies"
            type="text"
            placeholder="ex: React, Node.js"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            className="bg-card"
          />
        </div>
      </div>
      
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <Search className="mr-2 h-4 w-4" />
        Buscar Perfis
      </Button>
    </form>
  )
}
