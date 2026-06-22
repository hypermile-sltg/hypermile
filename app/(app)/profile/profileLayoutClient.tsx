'use client'

import ProfileNav from '@/components/layout/ProfileNav'
import { Separator } from '@/components/ui/separator'

interface ProfileLayoutClientProps {
  children: React.ReactNode
  initialRole: string
}

export default function ProfileLayoutClient({
  children,
  initialRole,
}: ProfileLayoutClientProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:gap-6">
      <div className="w-full md:w-auto md:flex-shrink-0">
        <ProfileNav userRole={initialRole} />
      </div>

      <Separator className="block md:hidden" />

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
