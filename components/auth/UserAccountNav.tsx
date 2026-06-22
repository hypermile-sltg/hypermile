'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Link from 'next/link'
import {
  CircleUser,
  LogOut as LogOutIcon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOutNextAuthFirebase } from '@/lib/actions/auth/sign-out-next-auth-firebase'
import { useSession } from 'next-auth/react'
import { getProfileMenu } from '@/lib/config'

export default function UserAccountNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<string>('user')
  const { data: session } = useSession()

  // 🔥 Fetch role dari API route
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/user/role')
        const data = await res.json()
        setRole(data.role)
      } catch (error) {
        console.error('Error fetching role:', error)
      }
    }

    if (session) {
      fetchRole()
    }
  }, [session])

  const handleClose = () => setIsOpen(false)

  const menu = getProfileMenu(role)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className='outline-none' asChild>
        <Avatar className='cursor-pointer h-9 w-9 border border-gray-200 bg-gray-100 shadow-sm'>
          {session?.user?.image ? (
            <AvatarImage
              src={session.user.image}
              alt="Akun"
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-gray-100 text-gray-500">
            <CircleUser className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menu.map((menuItem) => (
          <DropdownMenuItem key={menuItem.title} onClick={handleClose} asChild>
            <Link href={menuItem.href} className='flex items-center'>
              <menuItem.icon className='mr-2 h-4 w-4' />
              {menuItem.title}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer'
          onClick={() => {
            handleClose()
            signOutNextAuthFirebase()
          }}
        >
          <LogOutIcon className='mr-2 h-4 w-4' />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}