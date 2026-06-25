import { Users, LayoutTemplate, ShoppingBag } from 'lucide-react'
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
    title: 'Manage Users',
    href: '/profile',
    icon: Users,
  },
  {
    title: 'Edit Layout Home',
    href: '/profile/admin/edit-layout',
    icon: LayoutTemplate,
  },
  {
    title: 'Manage Products',
    href: '/profile/admin/edit-product',
    icon: ShoppingBag,
  },
]

export const getProfileMenu = (role: string | null) => {
  if (role && isAdminRole(role)) {
    return adminProfileMenu
  }
  return []
}
