import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ExternalLink } from 'lucide-react'

type ProfileCardProps = {
  profile: {
    id: string
    name: string
    headline: string
    location?: string
    photo_url?: string
    profile_url: string
  }
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <Link href={`/profile/${profile.id}`} className="group block">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-muted text-lg">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                {profile.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.headline}
              </p>
              {profile.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-start">
              <a
                href={profile.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
