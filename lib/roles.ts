export const USER_ROLES = ['user', 'admin', 'superadmin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export function isValidRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}

export function isAdminRole(role: string): role is 'admin' | 'superadmin' {
  return role === 'admin' || role === 'superadmin'
}

export function isSuperAdmin(role: string): boolean {
  return role === 'superadmin'
}

export function roleLabel(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'Super Admin'
    case 'admin':
      return 'Admin'
    default:
      return 'User'
  }
}
