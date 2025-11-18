import { Suspense } from 'react'
import ProfileDetails from '@/components/profile-details'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<ProfileDetailsSkeleton />}>
          <ProfileDetails profileId={id} />
        </Suspense>
      </div>
    </main>
  )
}

function ProfileDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
