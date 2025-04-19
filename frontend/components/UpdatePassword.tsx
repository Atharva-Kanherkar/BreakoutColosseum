'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Anton } from 'next/font/google'
import { supabase } from '@/lib/supabase'
import ParticleBackground from '@/components/ParticleBackground'

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

// Same password validation helpers from before
const PASSWORD_REGEX = {
  LOWERCASE: /[a-z]/,
  UPPERCASE: /[A-Z]/,
  NUMBER: /[0-9]/,
  SPECIAL: /[^A-Za-z0-9]/
}

function validatePassword(password: string) {
  const requirements = [
    { name: 'At least 8 characters', met: password.length >= 8 },
    { name: 'Contains uppercase letter', met: PASSWORD_REGEX.UPPERCASE.test(password) },
    { name: 'Contains lowercase letter', met: PASSWORD_REGEX.LOWERCASE.test(password) },
    { name: 'Contains number', met: PASSWORD_REGEX.NUMBER.test(password) },
    { name: 'Contains special character', met: PASSWORD_REGEX.SPECIAL.test(password) }
  ]
  
  const isValid = requirements.every(req => req.met)
  
  return { isValid, requirements }
}

export default function UpdatePassword() {
  const router = useRouter()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequirements, setPasswordRequirements] = useState<{name: string, met: boolean}[]>([])
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  
  // Check for valid reset token on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // If no session with access token, redirect to login
      if (!session?.access_token) {
        router.push('/signin')
      }
    }
    
    checkSession()
  }, [router])
  
  // Password validation
  useEffect(() => {
    if (password) {
      const { isValid, requirements } = validatePassword(password)
      setPasswordRequirements(requirements)
      setIsPasswordValid(isValid)
    }
  }, [password])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    if (!isPasswordValid) {
      setError("Password doesn't meet security requirements")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error
      
      // Redirect to login page with success message
      router.push('/signin?reset=success')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
      <ParticleBackground />
      
      {/* UI content similar to other forms but for password update */}
    </main>
  )
}