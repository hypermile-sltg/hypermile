'use client'

import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInWithEmailAndPassword, signOut as signOutFirebase, onAuthStateChanged } from 'firebase/auth'
import { FormEventHandler, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import LoadingText from '@/components/LoadingText'
import { Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function Page() {
  const router = useRouter()
  const { status } = useSession()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      router.replace('/profile')
      return
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        void signOutFirebase(auth)
      }
      setCheckingAuth(false)
    })

    return () => unsub()
  }, [router, status])

  const handleLogin: FormEventHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        await signOutFirebase(auth)
        toast.error('Email/password salah atau akun belum diaktifkan sebagai admin.')
        setIsLoading(false)
        return
      }

      toast.success('Login berhasil!')
      router.replace('/profile')
    } catch (error: any) {
      setIsLoading(false)
      toast.error(
        error.code === 'auth/invalid-credential'
          ? 'Email dan password salah. Coba lagi.'
          : error.code
      )
    }
  }

  if (checkingAuth || status === 'loading') return null

  return (
    <div className='mx-auto mt-20 max-w-md'>
      <Toaster />
      <section className='mb-10 flex flex-col items-center'>
        <h2>Log in to your account</h2>
      </section>

      <section>
        <form onSubmit={handleLogin}>
          <div className='mb-6'>
            <label htmlFor='email' className='mb-2 block font-medium'>
              Email address
            </label>
            <Input
              type='email'
              id='email'
              placeholder='Email'
              required
              value={loginData.email}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className='mb-12'>
            <div className='flex justify-between'>
              <label htmlFor='password' className='mb-2 block font-medium'>
                Password
              </label>
              <Link href='/forgot-password' className='font-bold hover:opacity-90'>
                Forgot password?
              </Link>
            </div>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                id='password'
                placeholder='Password'
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <button
                type='button'
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            className='w-full'
            disabled={isLoading || !loginData.email || !loginData.password}
          >
            {isLoading ? <LoadingText /> : 'Log in'}
          </Button>
        </form>

        <p className='mt-10 text-center text-sm text-gray-600'>
          Not a member?
          <Link href='/signup' className='ml-2 font-bold text-primary hover:opacity-90'>
            Sign up
          </Link>
        </p>
      </section>
    </div>
  )
}
