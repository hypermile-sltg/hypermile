import { Users, LayoutGrid } from 'lucide-react'
import { isAdminRole } from '@/lib/roles'

// HEADER
export const navMenu = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Service',
    href: '/services',
  },
  {
    title: 'Product',
    href: '/products',
  },
  {
    title: 'Gallery',
    href: '/gallery',
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
]

// PROFILE MENU (admin only)
const adminProfileMenu = [
  {
    title: 'Manage User',
    href: '/profile',
    icon: Users,
  },
  {
    title: 'Manage Content',
    href: '/profile/admin',
    icon: LayoutGrid,
  },
]

export const getProfileMenu = (role: string | null) => {
  if (role && isAdminRole(role)) {
    return adminProfileMenu
  }
  return []
}
