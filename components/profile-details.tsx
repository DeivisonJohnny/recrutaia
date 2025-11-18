'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, MapPin, ExternalLink, AlertCircle, Briefcase, GraduationCap, Loader2 } from 'lucide-react'

type ProfileData = {
  id: string
  name: string
  headline: string
  location?: string
  photo_url?: string
  profile_url: string
  summary?: string
  experiences?: Array<{
    title: string
    company: string
    company_logo?: string
    location?: string
    start_date?: string
    end_date?: string | null
    is_current?: boolean
    description?: string
    skills?: string[]
  }>
  education?: Array<{
    school: string
    degree?: string
    field?: string
    start_year?: string
    end_year?: string
  }>
  skills?: Array<{
    name: string
    endorsement_count: number
    insights?: string[]
  }>
  certifications?: Array<{
    name: string
    organization: string
  }>
  languages?: Array<{
    name: string
    proficiency?: string
  }>
  recommendations?: {
    given_total_count: number
    given: Array<{
      caption: string
      text: string
      recommender: {
        name: string
        headline: string
        profile_url: string
        photo_url?: string
      }
    }>
    received_total_count: number
    received: Array<{
      caption: string
      text: string
      recommender: {
        name: string
        headline: string
        profile_url: string
        photo_url?: string
      }
    }>
  } | null
  follower_count?: number
  connections_count?: number
  is_premium?: boolean
  is_creator?: boolean
}

type ProfileDetailsProps = {
  profileId: string
}

export default function ProfileDetails({ profileId }: ProfileDetailsProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/profile/${profileId}`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar perfil')
        }
        
        const data = await response.json()
        setProfile(data.profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Perfil não encontrado'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-muted text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-light tracking-tight text-foreground text-balance">
                  {profile.name}
                </h1>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  {profile.headline}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <a
                  href={profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Ver perfil no LinkedIn
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {profile.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {profile.experiences && profile.experiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Briefcase className="h-5 w-5" />
              Experiência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.experiences.map((exp, index) => (
              <div key={index} className="border-l-2 border-border pl-4">
                <h3 className="font-medium text-foreground">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                {(exp.start_date || exp.end_date) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.start_date} - {exp.is_current ? 'Presente' : exp.end_date}
                  </p>
                )}
                {exp.location && (
                  <p className="text-xs text-muted-foreground">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs font-light">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <GraduationCap className="h-5 w-5" />
              Educação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index}>
                <h3 className="font-medium text-foreground">{edu.school}</h3>
                {edu.degree && edu.field && (
                  <p className="text-sm text-muted-foreground">
                    {edu.degree} em {edu.field}
                  </p>
                )}
                {(edu.start_year || edu.end_year) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {edu.start_year} - {edu.end_year || 'Presente'}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="font-light">
                  {skill.name}
                  {skill.endorsement_count > 0 && (
                    <span className="ml-1 text-xs opacity-70">({skill.endorsement_count})</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Section */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Certificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.certifications.map((cert, index) => (
              <div key={index}>
                <h3 className="font-medium text-foreground">{cert.name}</h3>
                <p className="text-sm text-muted-foreground">{cert.organization}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {profile.recommendations && profile.recommendations.received_total_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Recomendações Recebidas ({profile.recommendations.received_total_count})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.recommendations.received.map((rec, index) => (
              <div key={index} className="border-l-2 border-border pl-4">
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &quot;{rec.text}&quot;
                </p>
                <div className="mt-2">
                  <p className="text-sm font-medium">{rec.recommender.name}</p>
                  <p className="text-xs text-muted-foreground">{rec.recommender.headline}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
