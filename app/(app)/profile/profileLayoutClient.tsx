'use client'

import ProfileNav from '@/components/layout/ProfileNav'

interface ProfileLayoutClientProps {
  children: React.ReactNode
  initialRole: string
}

export default function ProfileLayoutClient({
  children,
  initialRole,
}: ProfileLayoutClientProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-6 items-start overflow-x-hidden w-full px-4 pt-6 pb-4 md:px-0 md:pt-8 md:pb-0">
      <div className="w-full md:w-64 md:flex-shrink-0">
        <ProfileNav userRole={initialRole} />
      </div>

      <div className="flex-1 min-w-0 w-full overflow-x-hidden">{children}</div>
    </div>
  )
}
