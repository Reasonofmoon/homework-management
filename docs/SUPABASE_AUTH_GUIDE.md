# Complete Supabase Authentication Guide for Next.js

## 📚 Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Authentication Methods](#authentication-methods)
3. [Next.js Integration](#nextjs-integration)
4. [UI Components](#ui-components)
5. [Authorization & Access Control](#authorization--access-control)
6. [Error Handling & Validation](#error-handling--validation)
7. [Security Best Practices](#security-best-practices)
8. [Deployment Considerations](#deployment-considerations)
9. [Complete Code Examples](#complete-code-examples)

## 🚀 Supabase Setup

### Step 1: Create a Supabase Project

1. **Visit Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up or log in

2. **Create New Project**
   \`\`\`bash
   # Project Details
   Project Name: student-homework-app
   Database Password: [Generate strong password]
   Region: [Choose closest to your users]
   \`\`\`

3. **Wait for Project Initialization**
   - This takes 2-3 minutes
   - You'll get a project URL and API keys

### Step 2: Configure Authentication Settings

1. **Navigate to Authentication**
   \`\`\`
   Dashboard → Authentication → Settings
   \`\`\`

2. **Configure Site URL**
   \`\`\`
   Site URL: http://localhost:3000 (development)
   Site URL: https://yourdomain.com (production)
   \`\`\`

3. **Add Redirect URLs**
   \`\`\`
   Redirect URLs:
   - http://localhost:3000/auth/callback
   - https://yourdomain.com/auth/callback
   \`\`\`

4. **Enable Email Confirmations**
   \`\`\`
   Email Auth → Enable email confirmations: ON
   Email Auth → Enable email change confirmations: ON
   \`\`\`

### Step 3: Enable Authentication Providers

#### Email/Password Authentication
\`\`\`
Authentication → Providers → Email
- Enable email provider: ON
- Confirm email: ON (recommended)
- Secure email change: ON
\`\`\`

#### Google OAuth Setup
\`\`\`
Authentication → Providers → Google
1. Enable Google provider: ON
2. Get Google OAuth credentials:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     https://[your-project-ref].supabase.co/auth/v1/callback
3. Add Client ID and Client Secret to Supabase
\`\`\`

#### GitHub OAuth Setup
\`\`\`
Authentication → Providers → GitHub
1. Enable GitHub provider: ON
2. Create GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Authorization callback URL:
     https://[your-project-ref].supabase.co/auth/v1/callback
3. Add Client ID and Client Secret to Supabase
\`\`\`

### Step 4: Database Schema Setup

\`\`\`sql
-- Create profiles table for additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'teacher', 'student', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

## 🔐 Authentication Methods

### Method 1: Email/Password Authentication

**Pros:**
- Simple implementation
- No external dependencies
- Full control over user flow
- Works offline

**Cons:**
- Users must remember passwords
- Requires password reset functionality
- Higher security maintenance burden

**Implementation:**

\`\`\`typescript
// lib/supabase/auth-methods.ts
import { supabase } from './client'

export class EmailPasswordAuth {
  // Register new user
  static async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      return {
        success: true,
        user: data.user,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: '로그인되었습니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.message),
      }
    }
  }

  // Password reset
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return {
        success: true,
        message: '비밀번호 재설정 링크를 이메일로 보냈습니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Error message translation
  private static getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'Email not confirmed': '이메일 인증이 필요합니다.',
      'User already registered': '이미 등록된 이메일입니다.',
      'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
      'Email rate limit exceeded': '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    }

    return errorMessages[error] || error
  }
}
\`\`\`

### Method 2: OAuth Authentication (Google, GitHub)

**Pros:**
- Better user experience
- No password management
- Faster registration
- Trusted authentication

**Cons:**
- External service dependency
- Less control over user flow
- Privacy concerns
- Requires internet connection

**Implementation:**

\`\`\`typescript
// lib/supabase/oauth-auth.ts
import { supabase } from './client'

export class OAuthAuth {
  // Google OAuth
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Google 로그인을 진행합니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // GitHub OAuth
  static async signInWithGitHub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return {
        success: true,
        data,
        message: 'GitHub 로그인을 진행합니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Facebook OAuth
  static async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Facebook 로그인을 진행합니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
\`\`\`

### Method 3: Magic Link Authentication

**Pros:**
- No passwords required
- Secure by default
- Great user experience
- Reduces support burden

**Cons:**
- Requires email access
- Can be slower than password login
- Email deliverability issues

**Implementation:**

\`\`\`typescript
// lib/supabase/magic-link-auth.ts
import { supabase } from './client'

export class MagicLinkAuth {
  // Send magic link
  static async sendMagicLink(email: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return {
        success: true,
        message: '로그인 링크를 이메일로 보냈습니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Verify OTP
  static async verifyOtp(email: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) throw error

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: '로그인되었습니다.',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
\`\`\`

## ⚛️ Next.js Integration

### Supabase Client Configuration

\`\`\`typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './types'

// Client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Singleton client for client-side usage
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

// Export for backward compatibility
export const supabase = getSupabaseClient()
\`\`\`

### Authentication Hook

\`\`\`typescript
// hooks/use-supabase-auth.ts
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/auth-helpers-nextjs'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }

        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
        }))
      } catch (error: any) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setAuthState(prev => ({ ...prev, profile: null }))
        }

        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
        }))

        // Handle redirects
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setAuthState(prev => ({
        ...prev,
        profile: profile || null,
      }))

      return profile
    } catch (error: any) {
      console.error('Error fetching user profile:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message,
      }))
      return null
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!authState.user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) throw error

      setAuthState(prev => ({
        ...prev,
        profile: data,
      }))

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    ...authState,
    signOut,
    updateProfile,
    fetchUserProfile,
  }
}
\`\`\`

### Session Management

\`\`\`typescript
// lib/supabase/session-manager.ts
import { getSupabaseClient } from './client'

export class SessionManager {
  private static supabase = getSupabaseClient()

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) throw error
      
      return { success: true, session }
    } catch (error: any) {
      return { success: false, error: error.message, session: null }
    }
  }

  // Refresh session
  static async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession()
      
      if (error) throw error
      
      return { success: true, session }
    } catch (error: any) {
      return { success: false, error: error.message, session: null }
    }
  }

  // Check if session is valid
  static async isSessionValid() {
    const { session } = await this.getCurrentSession()
    
    if (!session) return false
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    return session.expires_at ? session.expires_at > now : false
  }

  // Auto-refresh session before expiry
  static startAutoRefresh() {
    const checkAndRefresh = async () => {
      const { session } = await this.getCurrentSession()
      
      if (session && session.expires_at) {
        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = session.expires_at - now
        
        // Refresh if less than 5 minutes remaining
        if (timeUntilExpiry < 300) {
          await this.refreshSession()
        }
      }
    }

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60000)
    
    return () => clearInterval(interval)
  }

  // Sign out and clear session
  static async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) throw error
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
\`\`\`

## 🎨 UI Components

### Registration Component

\`\`\`tsx
// components/auth/supabase-register-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Mail, User, Lock, CheckCircle } from 'lucide-react'
import { EmailPasswordAuth } from '@/lib/supabase/auth-methods'
import { AuthValidation } from '@/lib/validation/auth-validation'

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function SupabaseRegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validation = AuthValidation.validateRegistrationForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setIsLoading(true)

    try {
      const result = await EmailPasswordAuth.signUp(
        formData.email,
        formData.password,
        formData.fullName
      )

      if (result.success) {
        setSuccess(true)
        onSuccess?.()
      } else {
        setError(result.error || '회원가입에 실패했습니다.')
      }
    } catch (err: any) {
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">회원가입 완료!</CardTitle>
          <CardDescription>이메일 인증을 완료해주세요</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>{formData.email}</strong>로 인증 이메일을 보냈습니다. 
            이메일을 확인하고 링크를 클릭하여 계정을 활성화해주세요.
          </p>
          <p className="text-xs text-muted-foreground">
            이메일이 보이지 않나요? 스팸 폴더를 확인해보세요.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={onSwitchToLogin} className="w-full">
            로그인 페이지로 이동
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          새 계정을 만들어 시작하세요
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="홍길동"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className={`pl-10 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {validationErrors.fullName && (
              <p className="text-sm text-red-500">{validationErrors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange('email')}
                className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="최소 6자, 대소문자 및 숫자 포함"
                value={formData.password}
                onChange={handleChange('password')}
                className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            회원가입
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              로그인
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
\`\`\`

### Login Component

\`\`\`tsx
// components/auth/supabase-login-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { EmailPasswordAuth, OAuthAuth } from '@/lib/supabase/auth-methods'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onForgotPassword?: (email: string) => void
}

export function SupabaseLoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const result = await EmailPasswordAuth.signIn(email, password)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || '로그인에 실패했습니다.')
      }
    } catch (err: any) {
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(null)
    setOauthLoading(provider)

    try {
      let result
      if (provider === 'google') {
        result = await OAuthAuth.signInWithGoogle()
      } else {
        result = await OAuthAuth.signInWithGitHub()
      }

      if (!result.success) {
        setError(result.error || `${provider} 로그인에 실패했습니다.`)
      }
      // OAuth redirects, so we don't need to handle success here
    } catch (err: any) {
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setError('비밀번호 재설정을 위해 이메일을 먼저 입력해주세요.')
      return
    }
    onForgotPassword?.(email)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          계정에 로그인하여 계속하세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OAuth Login Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading || oauthLoading !== null}
            className="w-full"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 계속하기
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading || oauthLoading !== null}
            className="w-full"
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            GitHub으로 계속하기
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는 이메일로 계속하기
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading || oauthLoading !== null}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading || oauthLoading !== null}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || oauthLoading !== null}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300"
                disabled={isLoading || oauthLoading !== null}
              />
              <Label htmlFor="remember" className="text-sm">
                로그인 상태 유지
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={isLoading || oauthLoading !== null}
            >
              비밀번호 찾기
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || oauthLoading !== null || !email || !password}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            로그인
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">계정이 없으신가요? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium"
            disabled={isLoading || oauthLoading !== null}
          >
            회원가입
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}
\`\`\`

### OAuth Callback Handler

\`\`\`tsx
// app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session) {
          setStatus('success')
          setMessage('로그인이 완료되었습니다.')
          
          // Redirect to intended page or dashboard
          const redirectTo = searchParams.get('redirectTo') || '/dashboard'
          setTimeout(() => {
            router.push(redirectTo)
          }, 2000)
        } else {
          throw new Error('세션을 찾을 수 없습니다.')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || '인증 처리 중 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [supabase, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            {status === 'loading' && (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            )}
            {status === 'success' && (
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-3">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && '인증 처리 중...'}
            {status === 'success' && '로그인 성공!'}
            {status === 'error' && '인증 실패'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && '잠시만 기다려주세요.'}
            {status === 'success' && '곧 대시보드로 이동합니다.'}
            {status === 'error' && '다시 시도해주세요.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {message}
          </p>
          
          {status === 'error' && (
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              로그인 페이지로 돌아가기
            </Button>
          )}
          
          {status === 'success' && (
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              대시보드로 이동
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

## 🛡️ Authorization & Access Control

### Role-Based Access Control with Supabase

\`\`\`typescript
// lib/supabase/rbac.ts
import { getSupabaseClient } from './client'
import type { Database } from './types'

type UserRole = Database['public']['Tables']['profiles']['Row']['role']
type Permission = 'create' | 'read' | 'update' | 'delete'

export interface RolePermissions {
  [resource: string]: Permission[]
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    '*': ['create', 'read', 'update', 'delete'],
  },
  teacher: {
    classes: ['create', 'read', 'update', 'delete'],
    students: ['create', 'read', 'update', 'delete'],
    assignments: ['create', 'read', 'update', 'delete'],
    profiles: ['read', 'update'],
  },
  student: {
    assignments: ['read'],
    profiles: ['read', 'update'],
  },
  user: {
    profiles: ['read', 'update'],
  },
}

export class SupabaseRBAC {
  private static supabase = getSupabaseClient()

  // Check if user has permission for a resource
  static async hasPermission(
    userId: string,
    resource: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      // Get user role
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return false
      }

      const userRole = profile.role
      const rolePermissions = ROLE_PERMISSIONS[userRole]

      // Check wildcard permission (admin)
      if (rolePermissions['*']?.includes(permission)) {
        return true
      }

      // Check specific resource permission
      return rolePermissions[resource]?.includes(permission) || false
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  // Get user role
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return null
      }

      return profile.role
    } catch (error) {
      console.error('Get user role error:', error)
      return null
    }
  }

  // Check if user can access route
  static async canAccessRoute(userId: string, route: string): Promise<boolean> {
    const routePermissions: Record<string, { resource: string; permission: Permission }> = {
      '/dashboard': { resource: 'dashboard', permission: 'read' },
      '/dashboard/students': { resource: 'students', permission: 'read' },
      '/dashboard/assignments': { resource: 'assignments', permission: 'read' },
      '/dashboard/classes': { resource: 'classes', permission: 'read' },
      '/settings': { resource: 'profiles', permission: 'update' },
      '/admin': { resource: 'admin', permission: 'read' },
    }

    const routePermission = routePermissions[route]
    if (!routePermission) {
      return true // Allow access to unprotected routes
    }

    return this.hasPermission(userId, routePermission.resource, routePermission.permission)
  }

  // Filter data based on user role and ownership
  static async filterDataByRole<T extends { teacher_id?: string; student_id?: string }>(
    data: T[],
    userId: string
  ): Promise<T[]> {
    const userRole = await this.getUserRole(userId)

    switch (userRole) {
      case 'admin':
        return data // Admin sees everything
      case 'teacher':
        return data.filter(item => item.teacher_id === userId)
      case 'student':
        return data.filter(item => item.student_id === userId)
      default:
        return []
    }
  }

  // Update user role (admin only)
  static async updateUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: UserRole
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if admin has permission
      const hasPermission = await this.hasPermission(adminUserId, 'profiles', 'update')
      if (!hasPermission) {
        return { success: false, error: '권한이 없습니다.' }
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetUserId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
\`\`\`

### Protected Route Component for Supabase

\`\`\`tsx
// components/auth/supabase-protected-route.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { SupabaseRBAC } from '@/lib/supabase/rbac'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SupabaseProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: {
    resource: string
    action: 'create' | 'read' | 'update' | 'delete'
  }
  fallback?: React.ReactNode
}

export function SupabaseProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: SupabaseProtectedRouteProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, profile, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuthorization = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        let hasAccess = true

        // Check role requirement
        if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
          hasAccess = false
        }

        // Check permission requirement
        if (requiredPermission && hasAccess) {
          hasAccess = await SupabaseRBAC.hasPermission(
            user.id,
            requiredPermission.resource,
            requiredPermission.action
          )
        }

        setAuthorized(hasAccess)
      } catch (error) {
        console.error('Authorization check failed:', error)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [user, profile, authLoading, requiredRole, requiredPermission, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (authorized === false) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">접근 권한이 없습니다</CardTitle>
            <CardDescription>
              이 페이지에 접근할 권한이 없습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                현재 역할: <span className="font-medium">{profile?.role || '알 수 없음'}</span>
              </p>
              {requiredRole && (
                <p className="text-sm text-muted-foreground">
                  필요한 역할: <span className="font-medium">{requiredRole}</span>
                </p>
              )}
              {requiredPermission && (
                <p className="text-sm text-muted-foreground">
                  필요한 권한: <span className="font-medium">
                    {requiredPermission.resource}에 대한 {requiredPermission.action} 권한
                  </span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => router.back()} className="w-full">
                이전 페이지로 돌아가기
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                대시보드로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
\`\`\`

## 🚨 Error Handling & Validation

### Supabase Error Handler

\`\`\`typescript
// lib/supabase/error-handler.ts
import { AuthError, PostgrestError } from '@supabase/supabase-js'

export interface SupabaseErrorResult {
  success: false
  error: string
  code?: string
  details?: string
  isNetworkError?: boolean
  isAuthError?: boolean
  isValidationError?: boolean
}

export class SupabaseErrorHandler {
  // Main error handler
  static handleError(error: any, context?: string): SupabaseErrorResult {
    console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error)

    // Network errors
    if (this.isNetworkError(error)) {
      return {
        success: false,
        error: '네트워크 연결을 확인해주세요.',
        details: error.message,
        isNetworkError: true,
      }
    }

    // Auth errors
    if (this.isAuthError(error)) {
      return this.handleAuthError(error)
    }

    // Database errors
    if (this.isDatabaseError(error)) {
      return this.handleDatabaseError(error)
    }

    // Generic error
    return {
      success: false,
      error: error.message || '알 수 없는 오류가 발생했습니다.',
      details: error.message,
    }
  }

  // Check if error is network-related
  private static isNetworkError(error: any): boolean {
    const networkErrors = [
      'Failed to fetch',
      'Network request failed',
      'TypeError: Failed to fetch',
      'NetworkError',
      'Connection timeout',
    ]

    return networkErrors.some(netError => 
      error.message?.includes(netError) || error.toString().includes(netError)
    )
  }

  // Check if error is auth-related
  private static isAuthError(error: any): boolean {
    return error instanceof AuthError || error.name === 'AuthError'
  }

  // Check if error is database-related
  private static isDatabaseError(error: any): boolean {
    return error.code && typeof error.code === 'string' && error.code.startsWith('PGRST')
  }

  // Handle authentication errors
  private static handleAuthError(error: AuthError): SupabaseErrorResult {
    const authErrorMessages: Record<string, string> = {
      'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
      'User already registered': '이미 등록된 이메일입니다.',
      'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
      'Email rate limit exceeded': '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      'Signup disabled': '회원가입이 비활성화되어 있습니다.',
      'Invalid API key': 'API 키가 올바르지 않습니다.',
      'Project not found': '프로젝트를 찾을 수 없습니다.',
      'Token has expired or is invalid': '토큰이 만료되었거나 유효하지 않습니다.',
      'User not found': '사용자를 찾을 수 없습니다.',
    }

    const userMessage = authErrorMessages[error.message] || error.message

    return {
      success: false,
      error: userMessage,
      code: error.status?.toString(),
      details: error.message,
      isAuthError: true,
    }
  }

  // Handle database errors
  private static handleDatabaseError(error: PostgrestError): SupabaseErrorResult {
    const dbErrorMessages: Record<string, string> = {
      'PGRST116': '데이터를 찾을 수 없습니다.',
      'PGRST301': '접근 권한이 없습니다.',
      '23505': '이미 존재하는 데이터입니다.',
      '23503': '참조된 데이터가 존재하지 않습니다.',
      '42501': '권한이 부족합니다.',
    }

    const userMessage = dbErrorMessages[error.code] || '데이터베이스 오류가 발생했습니다.'

    return {
      success: false,
      error: userMessage,
      code: error.code,
      details: error.message,
      isValidationError: error.code === '23505' || error.code === '23503',
    }
  }

  // Validation error helper
  static createValidationError(field: string, message: string): SupabaseErrorResult {
    return {
      success: false,
      error: `${field}: ${message}`,
      isValidationError: true,
    }
  }

  // Success result helper
  static createSuccess<T>(data?: T, message?: string) {
    return {
      success: true as const,
      data,
      message,
    }
  }
}
\`\`\`

### Form Validation for Supabase

\`\`\`typescript
// lib/validation/supabase-validation.ts
export interface SupabaseValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings?: Record<string, string>
}

export class SupabaseValidation {
  // Validate email format and availability
  static async validateEmail(email: string, checkAvailability = false): Promise<SupabaseValidationResult> {
    const errors: Record<string, string> = {}

    if (!email) {
      errors.email = '이메일을 입력해주세요.'
    } else if (!this.isValidEmailFormat(email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.'
    } else if (checkAvailability) {
      // Check if email is already registered
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single()

        if (data && !error) {
          errors.email = '이미 등록된 이메일입니다.'
        }
      } catch (error) {
        // If error is PGRST116 (no rows), email is available
        // Other errors should be handled separately
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  // Validate password strength
  static validatePassword(password: string): SupabaseValidationResult {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    if (!password) {
      errors.password = '비밀번호를 입력해주세요.'
    } else {
      if (password.length < 8) {
        errors.password = '비밀번호는 최소 8자 이상이어야 합니다.'
      } else if (password.length < 12) {
        warnings.password = '더 안전한 비밀번호를 위해 12자 이상을 권장합니다.'
      }

      if (!/(?=.*[a-z])/.test(password)) {
        errors.password = '비밀번호는 소문자를 포함해야 합니다.'
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        errors.password = '비밀번호는 대문자를 포함해야 합니다.'
      }

      if (!/(?=.*\d)/.test(password)) {
        errors.password = '비밀번호는 숫자를 포함해야 합니다.'
      }

      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
        warnings.password = '특수문자를 포함하면 더 안전합니다.'
      }

      // Check for common weak passwords
      const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
      ]

      if (commonPasswords.includes(password.toLowerCase())) {
        errors.password = '너무 일반적인 비밀번호입니다. 다른 비밀번호를 선택해주세요.'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    }
  }

  // Validate user profile data
  static validateProfile(profileData: {
    full_name?: string
    role?: string
    avatar_url?: string
  }): SupabaseValidationResult {
    const errors: Record<string, string> = {}

    if (profileData.full_name !== undefined) {
      if (!profileData.full_name?.trim()) {
        errors.full_name = '이름을 입력해주세요.'
      } else if (profileData.full_name.trim().length < 2) {
        errors.full_name = '이름은 최소 2자 이상이어야 합니다.'
      } else if (profileData.full_name.trim().length > 50) {
        errors.full_name = '이름은 50자를 초과할 수 없습니다.'
      } else if (!/^[가-힣a-zA-Z\s]+$/.test(profileData.full_name.trim())) {
        errors.full_name = '이름은 한글, 영문, 공백만 사용할 수 있습니다.'
      }
    }

    if (profileData.role !== undefined) {
      const validRoles = ['admin', 'teacher', 'student', 'user']
      if (!validRoles.includes(profileData.role)) {
        errors.role = '유효하지 않은 역할입니다.'
      }
    }

    if (profileData.avatar_url !== undefined && profileData.avatar_url) {
      if (!this.isValidUrl(profileData.avatar_url)) {
        errors.avatar_url = '올바른 URL 형식을 입력해주세요.'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  // Validate registration form
  static async validateRegistrationForm(formData: {
    email: string
    password: string
    confirmPassword: string
    full_name: string
  }): Promise<SupabaseValidationResult> {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}

    // Validate email
    const emailValidation = await this.validateEmail(formData.email, true)
    Object.assign(errors, emailValidation.errors)

    // Validate password
    const passwordValidation = this.validatePassword(formData.password)
    Object.assign(errors, passwordValidation.errors)
    Object.assign(warnings, passwordValidation.warnings || {})

    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // Validate name
    const profileValidation = this.validateProfile({ full_name: formData.full_name })
    Object.assign(errors, profileValidation.errors)

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    }
  }

  // Helper methods
  private static isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}
\`\`\`

## 🔒 Security Best Practices

### Supabase Security Configuration

\`\`\`typescript
// lib/supabase/security-config.ts
export const SUPABASE_SECURITY_CONFIG = {
  // Row Level Security policies
  rls: {
    enabled: true,
    policies: {
      profiles: {
        select: 'auth.uid() = id',
        update: 'auth.uid() = id',
        insert: 'auth.uid() = id',
        delete: 'auth.uid() = id AND role != \'admin\'',
      },
      classes: {
        select: 'auth.uid() = teacher_id',
        update: 'auth.uid() = teacher_id',
        insert: 'auth.uid() = teacher_id',
        delete: 'auth.uid() = teacher_id',
      },
    },
  },

  // API security
  api: {
    rateLimiting: {
      enabled: true,
      requests: 100,
      window: '15m',
    },
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000'],
      credentials: true,
    },
  },

  // Authentication security
  auth: {
    sessionTimeout: 24 * 60 * 60, // 24 hours
    refreshThreshold: 15 * 60, // 15 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60, // 30 minutes
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },

  // Data encryption
  encryption: {
    sensitiveFields: ['email', 'full_name'],
    algorithm: 'AES-256-GCM',
  },
}

export class SupabaseSecurity {
  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  // Validate API key format
  static validateApiKey(key: string): boolean {
    // Supabase API keys have specific format
    const supabaseKeyRegex = /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    return supabaseKeyRegex.test(key)
  }

  // Check for suspicious activity
  static detectSuspiciousActivity(
    attempts: number,
    timeWindow: number,
    maxAttempts: number
  ): boolean {
    return attempts >= maxAttempts
  }

  // Generate secure tokens
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate file uploads
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: '허용되지 않는 파일 형식입니다.' }
    }

    if (file.size > maxSize) {
      return { isValid: false, error: '파일 크기가 너무 큽니다. (최대 5MB)' }
    }

    return { isValid: true }
  }

  // Audit log entry
  static async logSecurityEvent(
    event: string,
    userId?: string,
    details?: Record<string, any>
  ) {
    try {
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()

      await supabase.from('security_logs').insert({
        event,
        user_id: userId,
        details,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  // Get client IP (for logging purposes)
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}
\`\`\`

### Middleware for Supabase Security

\`\`\`typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SupabaseSecurity } from '@/lib/supabase/security-config'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
  )

  // Rate limiting check
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitKey = `rate_limit:${clientIP}`
  
  // In production, you'd use Redis or similar for rate limiting
  // This is a simplified example

  try {
    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define route protection
    const protectedRoutes = ['/dashboard', '/settings', '/admin']
    const authRoutes = ['/auth/login', '/auth/register']
    const adminRoutes = ['/admin']

    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )
    const isAuthRoute = authRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )
    const isAdminRoute = adminRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      
      // Log security event
      await SupabaseSecurity.logSecurityEvent(
        'unauthorized_access_attempt',
        undefined,
        { route: req.nextUrl.pathname, ip: clientIP }
      )
      
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes with session
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Check admin access
    if (isAdminRoute && session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        // Log unauthorized admin access attempt
        await SupabaseSecurity.logSecurityEvent(
          'unauthorized_admin_access',
          session.user.id,
          { route: req.nextUrl.pathname, role: profile?.role }
        )
        
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Log successful access for sensitive routes
    if (isProtectedRoute && session) {
      await SupabaseSecurity.logSecurityEvent(
        'route_access',
        session.user.id,
        { route: req.nextUrl.pathname }
      )
    }

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Log middleware errors
    await SupabaseSecurity.logSecurityEvent(
      'middleware_error',
      undefined,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
\`\`\`

## 🚀 Deployment Considerations

### Environment Variables for Production

\`\`\`bash
# .env.production
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
NEXTAUTH_SECRET=your-super-secret-jwt-secret
NEXTAUTH_URL=https://yourdomain.com

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=your-analytics-id
\`\`\`

### Vercel Deployment Configuration

\`\`\`json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/dashboard",
      "permanent": false,
      "has": [
        {
          "type": "cookie",
          "key": "supabase-auth-token"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "/api/auth/:path*"
    }
  ]
}
\`\`\`

### Production Database Setup

\`\`\`sql
-- database/production-setup.sql
-- Production-ready database setup for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    UNIQUE(identifier, action, window_start)
);

-- Create index for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, action, window_start);

-- Auto-cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start
    window_start := date_trunc('minute', NOW()) - 
                   (EXTRACT(minute FROM NOW())::INTEGER % p_window_minutes) * INTERVAL '1 minute';
    
    -- Get current count
    SELECT count INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier
    AND action = p_action
    AND window_start = window_start;
    
    -- If no record exists, create one
    IF current_count IS NULL THEN
        INSERT INTO rate_limits (identifier, action, count, window_start, expires_at)
        VALUES (p_identifier, p_action, 1, window_start, window_start + (p_window_minutes * INTERVAL '1 minute'));
        RETURN TRUE;
    -- If under limit, increment
    ELSIF current_count < p_max_attempts THEN
        UPDATE rate_limits
        SET count = count + 1
        WHERE identifier = p_identifier
        AND action = p_action
        AND window_start = window_start;
        RETURN TRUE;
    -- If over limit, deny
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO security_logs (event, user_id, details)
        VALUES (
            'profile_updated',
            NEW.id,
            jsonb_build_object(
                'old_data', row_to_json(OLD),
                'new_data', row_to_json(NEW),
                'changed_fields', (
                    SELECT jsonb_object_agg(key, value)
                    FROM jsonb_each(to_jsonb(NEW))
                    WHERE to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
                )
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile changes
CREATE TRIGGER profile_audit_trigger
    AFTER UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- Enable RLS on security tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for security logs (admin only)
CREATE POLICY "Admins can view security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policy for rate limits (system only)
CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (false); -- Only accessible via functions

-- Schedule cleanup job (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *', 'SELECT cleanup_rate_limits();');
\`\`\`

### Deployment Checklist

\`\`\`markdown
# Supabase + Next.js Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured in Vercel/Netlify
- [ ] Supabase project configured for production
- [ ] Database schema deployed and tested
- [ ] RLS policies enabled and tested
- [ ] OAuth providers configured with production URLs
- [ ] Email templates customized
- [ ] Rate limiting configured

## Security
- [ ] API keys secured and not exposed
- [ ] CORS configured correctly
- [ ] Security headers implemented
- [ ] Input validation in place
- [ ] SQL injection protection verified
- [ ] XSS protection implemented
- [ ] CSRF protection enabled

## Authentication
- [ ] Email confirmation flow tested
- [ ] Password reset flow tested
- [ ] OAuth flows tested
- [ ] Session management working
- [ ] Role-based access control tested
- [ ] Protected routes working

## Database
- [ ] Row Level Security enabled
- [ ] Database policies tested
- [ ] Backup strategy in place
- [ ] Connection pooling configured
- [ ] Performance optimized
- [ ] Monitoring enabled

## Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Security event logging active
- [ ] Analytics configured

## Testing
- [ ] Authentication flows tested
- [ ] Authorization rules tested
- [ ] Error handling tested
- [ ] Performance tested
- [ ] Security tested
- [ ] Mobile responsiveness tested

## Post-Deployment
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] CDN configured (if needed)
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team access configured
\`\`\`

## 📚 Complete Implementation Example

\`\`\`tsx
// app/auth/page.tsx
'use client'

import { useState } from 'react'
import { SupabaseLoginForm } from '@/components/auth/supabase-login-form'
import { SupabaseRegisterForm } from '@/components/auth/supabase-register-form'
import { PasswordReset } from '@/components/auth/password-reset'
import { EmailPasswordAuth } from '@/lib/supabase/auth-methods'
import { useToast } from '@/hooks/use-toast'

type AuthMode = 'login' | 'register' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [resetEmail, setResetEmail] = useState('')
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: '성공',
      description: mode === 'login' ? '로그인되었습니다.' : '회원가입이 완료되었습니다.',
    })
  }

  const handlePasswordReset = async (email: string) => {
    const result = await EmailPasswordAuth.resetPassword(email)
    
    if (result.success) {
      toast({
        title: '재설정 링크 전송',
        description: result.message,
      })
    } else {
      toast({
        title: '오류',
        description: result.error,
        variant: 'destructive',
      })
    }
    
    return result
  }

  const handleForgotPassword = (email: string) => {
    setResetEmail(email)
    setMode('reset')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <SupabaseLoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('register')}
            onForgotPassword={handleForgotPassword}
          />
        )}

        {mode === 'register' && (
          <SupabaseRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'reset' && (
          <PasswordReset
            onResetPassword={handlePasswordReset}
            onBackToLogin={() => setMode('login')}
            initialEmail={resetEmail}
          />
        )}
      </div>
    </div>
  )
}
\`\`\`

This comprehensive guide provides everything needed to implement secure, production-ready Supabase authentication in Next.js applications. The examples include proper error handling, validation, security measures, and deployment considerations for real-world applications.
