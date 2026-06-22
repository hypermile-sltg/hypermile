'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getProfileMenu } from '@/lib/config'

interface ProfileNavProps {
  userRole: string
}

export default function ProfileNav({ userRole }: ProfileNavProps) {
  const pathname = usePathname() as string
  
  // 🔥 Langsung pakai role dari props (tanpa delay)
  const profileMenu = getProfileMenu(userRole)

  return (
    <div className="flex gap-1 overflow-auto md:flex-col md:overflow-visible">
      {profileMenu.map((menu) => {
        const isActive =
          menu.href === '/profile'
            ? pathname === '/profile'
            : pathname.startsWith(menu.href)

        return (
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          className="justify-start md:w-full"
          key={menu.title}
          asChild
        >
          <Link href={menu.href}>
            {menu.icon && <menu.icon className="mr-2 h-4 w-4" />}
            {menu.title}
          </Link>
        </Button>
        )
      })}
    </div>
  )
}