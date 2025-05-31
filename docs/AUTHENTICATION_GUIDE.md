# Complete Next.js Authentication & Authorization Guide for Beginners

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Authentication Methods](#authentication-methods)
3. [UI Components](#ui-components)
4. [Backend Integration](#backend-integration)
5. [Authorization & Access Control](#authorization--access-control)
6. [Error Handling & Validation](#error-handling--validation)
7. [Security Best Practices](#security-best-practices)
8. [Deployment Considerations](#deployment-considerations)
9. [Complete Code Examples](#complete-code-examples)

## 🎯 Introduction

Authentication and authorization are fundamental aspects of modern web applications. This guide will teach you how to implement secure user authentication and role-based access control in Next.js applications.

### Key Concepts

- **Authentication**: Verifying who a user is (login/signup)
- **Authorization**: Determining what a user can access (permissions)
- **Session Management**: Maintaining user state across requests
- **Role-Based Access Control (RBAC)**: Restricting access based on user roles

## 🔐 Authentication Methods

### Method 1: Email/Password Authentication

**Pros:**
- Simple to implement
- No third-party dependencies
- Full control over user data
- Works offline

**Cons:**
- Users need to remember passwords
- Requires password reset functionality
- Higher security responsibility

**Implementation Steps:**

1. **Set up password hashing**
2. **Create registration endpoint**
3. **Implement login validation**
4. **Handle password resets**

### Method 2: Social Login (Google OAuth)

**Pros:**
- Better user experience (no password to remember)
- Faster registration process
- Reduced security burden
- Higher conversion rates

**Cons:**
- Dependency on third-party services
- Less control over user data
- Requires internet connection
- Privacy concerns for some users

**Implementation Steps:**

1. **Configure OAuth provider**
2. **Set up redirect URLs**
3. **Handle OAuth callbacks**
4. **Manage user profiles**

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
- Not suitable for all use cases

## 🎨 UI Components

Let's create comprehensive UI components for authentication:

### 1. Registration Component

\`\`\`tsx
// components/auth/register-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Mail, User, Lock } from 'lucide-react'

interface RegisterFormProps {
  onRegister: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  onSwitchToLogin: () => void
}

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      errors.email = "이메일을 입력해주세요."
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "올바른 이메일 형식을 입력해주세요."
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "이름을 입력해주세요."
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "이름은 최소 2자 이상이어야 합니다."
    }

    // Password validation
    if (!formData.password) {
      errors.password = "비밀번호를 입력해주세요."
    } else if (formData.password.length < 8) {
      errors.password = "비밀번호는 최소 8자 이상이어야 합니다."
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다."
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await onRegister(formData)
      if (!result.success) {
        setError(result.error || "회원가입에 실패했습니다.")
      }
    } catch (err) {
      setError("예상치 못한 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
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
                onChange={handleChange("fullName")}
                className={`pl-10 ${validationErrors.fullName ? "border-red-500" : ""}`}
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
                onChange={handleChange("email")}
                className={`pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
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
                type={showPassword ? "text" : "password"}
                placeholder="최소 8자, 대소문자 및 숫자 포함"
                value={formData.password}
                onChange={handleChange("password")}
                className={`pl-10 pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className={`pl-10 pr-10 ${validationErrors.confirmPassword ? "border-red-500" : ""}`}
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

### 2. Login Component

\`\`\`tsx
// components/auth/login-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onSwitchToRegister: () => void
  onForgotPassword: (email: string) => void
}

export function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const result = await onLogin(email, password)
      if (!result.success) {
        setError(result.error || "로그인에 실패했습니다.")
      }
    } catch (err) {
      setError("예상치 못한 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setError("비밀번호 재설정을 위해 이메일을 먼저 입력해주세요.")
      return
    }
    onForgotPassword(email)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          계정에 로그인하여 계속하세요
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                disabled={isLoading}
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
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
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
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm">
                로그인 상태 유지
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              비밀번호 찾기
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email || !password}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            로그인
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              회원가입
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
\`\`\`

### 3. Social Login Component

\`\`\`tsx
// components/auth/social-login.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from 'lucide-react'

interface SocialLoginProps {
  onGoogleLogin: () => Promise<{ success: boolean; error?: string }>
  onFacebookLogin?: () => Promise<{ success: boolean; error?: string }>
  onGithubLogin?: () => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
}

export function SocialLogin({ 
  onGoogleLogin, 
  onFacebookLogin, 
  onGithubLogin, 
  disabled = false 
}: SocialLoginProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSocialLogin = async (
    provider: string,
    loginFunction: () => Promise<{ success: boolean; error?: string }>
  ) => {
    setLoadingProvider(provider)
    try {
      await loginFunction()
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            또는 소셜 계정으로 계속하기
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {/* Google Login */}
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google", onGoogleLogin)}
          disabled={disabled || loadingProvider !== null}
          className="w-full"
        >
          {loadingProvider === "google" ? (
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

        {/* Facebook Login */}
        {onFacebookLogin && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("facebook", onFacebookLogin)}
            disabled={disabled || loadingProvider !== null}
            className="w-full"
          >
            {loadingProvider === "facebook" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            Facebook으로 계속하기
          </Button>
        )}

        {/* GitHub Login */}
        {onGithubLogin && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("github", onGithubLogin)}
            disabled={disabled || loadingProvider !== null}
            className="w-full"
          >
            {loadingProvider === "github" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            GitHub으로 계속하기
          </Button>
        )}
      </div>
    </div>
  )
}
\`\`\`

### 4. Password Reset Component

\`\`\`tsx
// components/auth/password-reset.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

interface PasswordResetProps {
  onResetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  onBackToLogin: () => void
  initialEmail?: string
}

export function PasswordReset({ onResetPassword, onBackToLogin, initialEmail = "" }: PasswordResetProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("이메일을 입력해주세요.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const result = await onResetPassword(email)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "비밀번호 재설정에 실패했습니다.")
      }
    } catch (err) {
      setError("예상치 못한 오류가 발생했습니다.")
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
          <CardTitle className="text-2xl font-bold">이메일을 확인하세요</CardTitle>
          <CardDescription>
            비밀번호 재설정 링크를 보냈습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다. 
            이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정해주세요.
          </p>
          <p className="text-xs text-muted-foreground">
            이메일이 보이지 않나요? 스팸 폴더를 확인해보세요.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={onBackToLogin} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            로그인으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">비밀번호 재설정</CardTitle>
        <CardDescription className="text-center">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            재설정 링크 보내기
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={onBackToLogin}
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            로그인으로 돌아가기
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
\`\`\`

## 🔧 Backend Integration

### Supabase Integration Example

\`\`\`tsx
// lib/auth/supabase-auth.ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  role: "admin" | "teacher" | "student"
  avatar?: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

export class AuthService {
  // Email/Password Registration
  static async register(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "teacher", // Default role
          },
        },
      })

      if (error) throw error

      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Email/Password Login
  static async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update last login time
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", data.user.id)
      }

      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Google OAuth Login
  static async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Password Reset
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Update Password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Logout
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get Current User
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      // Get additional profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      return {
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name || user.user_metadata?.full_name,
        role: profile?.role || "teacher",
        avatar: profile?.avatar_url,
        emailVerified: user.email_confirmed_at !== null,
        createdAt: user.created_at,
        lastLoginAt: profile?.last_login_at,
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Update User Profile
  static async updateProfile(updates: Partial<AuthUser>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No authenticated user")

      // Update auth metadata if needed
      const authUpdates: any = {}
      if (updates.fullName) {
        authUpdates.data = { full_name: updates.fullName }
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates)
        if (authError) throw authError
      }

      // Update profile table
      const profileUpdates: any = {}
      if (updates.fullName) profileUpdates.full_name = updates.fullName
      if (updates.avatar) profileUpdates.avatar_url = updates.avatar
      if (updates.role) profileUpdates.role = updates.role

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (profileError) throw profileError
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
\`\`\`

## 🛡️ Authorization & Access Control

### Role-Based Access Control (RBAC)

\`\`\`tsx
// lib/auth/rbac.ts
export type UserRole = "admin" | "teacher" | "student"

export interface Permission {
  resource: string
  action: "create" | "read" | "update" | "delete"
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin can do everything
    { resource: "*", action: "create" },
    { resource: "*", action: "read" },
    { resource: "*", action: "update" },
    { resource: "*", action: "delete" },
  ],
  teacher: [
    // Teachers can manage their own classes and students
    { resource: "classes", action: "create" },
    { resource: "classes", action: "read" },
    { resource: "classes", action: "update" },
    { resource: "classes", action: "delete" },
    { resource: "students", action: "create" },
    { resource: "students", action: "read" },
    { resource: "students", action: "update" },
    { resource: "students", action: "delete" },
    { resource: "assignments", action: "create" },
    { resource: "assignments", action: "read" },
    { resource: "assignments", action: "update" },
    { resource: "assignments", action: "delete" },
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
  ],
  student: [
    // Students can only view their own data
    { resource: "assignments", action: "read" },
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
  ],
}

export class RBACService {
  static hasPermission(
    userRole: UserRole,
    resource: string,
    action: Permission["action"]
  ): boolean {
    const permissions = ROLE_PERMISSIONS[userRole]
    
    return permissions.some(
      (permission) =>
        (permission.resource === "*" || permission.resource === resource) &&
        permission.action === action
    )
  }

  static canAccessRoute(userRole: UserRole, route: string): boolean {
    const routePermissions: Record<string, { resource: string; action: Permission["action"] }> = {
      "/dashboard": { resource: "dashboard", action: "read" },
      "/dashboard/students": { resource: "students", action: "read" },
      "/dashboard/assignments": { resource: "assignments", action: "read" },
      "/dashboard/analytics": { resource: "analytics", action: "read" },
      "/settings": { resource: "profile", action: "update" },
      "/admin": { resource: "admin", action: "read" },
    }

    const permission = routePermissions[route]
    if (!permission) return true // Allow access to unprotected routes

    return this.hasPermission(userRole, permission.resource, permission.action)
  }

  static filterDataByRole<T extends { teacherId?: string; studentId?: string }>(
    data: T[],
    userRole: UserRole,
    userId: string
  ): T[] {
    switch (userRole) {
      case "admin":
        return data // Admin sees everything
      case "teacher":
        return data.filter((item) => item.teacherId === userId)
      case "student":
        return data.filter((item) => item.studentId === userId)
      default:
        return []
    }
  }
}
\`\`\`

### Protected Route Component

\`\`\`tsx
// components/auth/protected-route.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService, type AuthUser } from "@/lib/auth/supabase-auth"
import { RBACService, type UserRole } from "@/lib/auth/rbac"
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: {
    resource: string
    action: "create" | "read" | "update" | "delete"
  }
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)

        if (!currentUser) {
          router.push("/auth/login")
          return
        }

        // Check role requirement
        if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== "admin") {
          setAuthorized(false)
          return
        }

        // Check permission requirement
        if (requiredPermission) {
          const hasPermission = RBACService.hasPermission(
            currentUser.role,
            requiredPermission.resource,
            requiredPermission.action
          )
          if (!hasPermission) {
            setAuthorized(false)
            return
          }
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, requiredPermission])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-4">
            이 페이지에 접근할 권한이 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
\`\`\`

### Auth Context Provider

\`\`\`tsx
// contexts/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type AuthUser } from "@/lib/auth/supabase-auth"
import { supabase } from "@/lib/auth/supabase-auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password)
    if (result.success) {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    }
    return result
  }

  const register = async (email: string, password: string, fullName: string) => {
    const result = await AuthService.register(email, password, fullName)
    if (result.success) {
      // Note: User will need to verify email before being fully authenticated
    }
    return result
  }

  const logout = async () => {
    await AuthService.logout()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    const result = await AuthService.updateProfile(updates)
    if (result.success) {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    }
    return result
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
\`\`\`

## 🚨 Error Handling & Validation

### Form Validation Utilities

\`\`\`tsx
// lib/validation/auth-validation.ts
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class AuthValidation {
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: "이메일을 입력해주세요." }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "올바른 이메일 형식을 입력해주세요." }
    }

    return { isValid: true }
  }

  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: "비밀번호를 입력해주세요." }
    }

    if (password.length < 8) {
      return { isValid: false, error: "비밀번호는 최소 8자 이상이어야 합니다." }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, error: "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다." }
    }

    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return { isValid: false, error: "비밀번호는 특수문자를 포함해야 합니다." }
    }

    return { isValid: true }
  }

  static validateName(name: string): { isValid: boolean; error?: string } {
    if (!name?.trim()) {
      return { isValid: false, error: "이름을 입력해주세요." }
    }

    if (name.trim().length < 2) {
      return { isValid: false, error: "이름은 최소 2자 이상이어야 합니다." }
    }

    if (name.trim().length > 50) {
      return { isValid: false, error: "이름은 50자를 초과할 수 없습니다." }
    }

    return { isValid: true }
  }

  static validateRegistrationForm(data: {
    email: string
    password: string
    confirmPassword: string
    fullName: string
  }): ValidationResult {
    const errors: Record<string, string> = {}

    // Validate email
    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!
    }

    // Validate name
    const nameValidation = this.validateName(data.fullName)
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error!
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error!
    }

    // Validate password confirmation
    if (!data.confirmPassword) {
      errors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  static validateLoginForm(data: {
    email: string
    password: string
  }): ValidationResult {
    const errors: Record<string, string> = {}

    if (!data.email) {
      errors.email = "이메일을 입력해주세요."
    }

    if (!data.password) {
      errors.password = "비밀번호를 입력해주세요."
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}
\`\`\`

### Error Boundary Component

\`\`\`tsx
// components/auth/auth-error-boundary.tsx
"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AuthErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <div className="space-y-2">
                  <p className="font-medium">인증 시스템에 오류가 발생했습니다</p>
                  <p className="text-sm">
                    {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="secondary"
              >
                페이지 새로고침
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
\`\`\`

## 🔒 Security Best Practices

### Security Configuration

\`\`\`tsx
// lib/security/security-config.ts
export const SECURITY_CONFIG = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90, // days
  },

  // Session configuration
  session: {
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    renewThreshold: 15 * 60, // Renew if less than 15 minutes left
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  },

  // Rate limiting
  rateLimit: {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDuration: 30 * 60 * 1000, // 30 minutes
    },
    registration: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
    passwordReset: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
  },

  // CSRF protection
  csrf: {
    enabled: true,
    sameSite: "strict" as const,
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.NEXT_PUBLIC_SUPABASE_URL!],
  },
}

export class SecurityService {
  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
  }

  // XSS prevention
  static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  // Generate secure random tokens
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate file uploads
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: "허용되지 않는 파일 형식입니다." }
    }

    if (file.size > maxSize) {
      return { isValid: false, error: "파일 크기가 너무 큽니다. (최대 5MB)" }
    }

    return { isValid: true }
  }

  // Check for suspicious activity
  static detectSuspiciousActivity(
    attempts: number,
    timeWindow: number,
    maxAttempts: number
  ): boolean {
    return attempts >= maxAttempts
  }
}
\`\`\`

### Middleware for Route Protection

\`\`\`tsx
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define route protection rules
  const protectedRoutes = ["/dashboard", "/settings", "/admin"]
  const authRoutes = ["/auth/login", "/auth/register"]
  const adminRoutes = ["/admin"]

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
    const redirectUrl = new URL("/auth/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if accessing auth routes with session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Check admin access
  if (isAdminRoute && session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
\`\`\`

## 🚀 Deployment Considerations

### Environment Variables Setup

\`\`\`bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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
  ]
}
\`\`\`

### Production Security Checklist

\`\`\`markdown
# Production Security Checklist

## Environment & Configuration
- [ ] All environment variables are set in production
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled for all endpoints
- [ ] Secure cookie settings configured
- [ ] CORS properly configured

## Authentication & Authorization
- [ ] Strong password policies enforced
- [ ] Rate limiting implemented
- [ ] Session timeout configured
- [ ] Multi-factor authentication available
- [ ] Role-based access control working

## Database Security
- [ ] Row Level Security (RLS) enabled
- [ ] Database policies tested
- [ ] No direct database access from client
- [ ] Backup and recovery procedures in place
- [ ] Database connection pooling configured

## API Security
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection implemented
- [ ] CSRF tokens in use
- [ ] API rate limiting active

## Monitoring & Logging
- [ ] Error tracking configured
- [ ] Security event logging
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert systems configured
\`\`\`

### Database Migration Script

\`\`\`sql
-- database/production-setup.sql
-- Production database setup with security considerations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER classes_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON classes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, action, window_start)
);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(identifier, action, window_start);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER,
    p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := date_trunc('minute', NOW()) - (EXTRACT(minute FROM NOW())::INTEGER % p_window_minutes) * INTERVAL '1 minute';
    
    SELECT count INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier
    AND action = p_action
    AND window_start = window_start;
    
    IF current_count IS NULL THEN
        INSERT INTO rate_limits (identifier, action, count, window_start)
        VALUES (p_identifier, p_action, 1, window_start);
        RETURN TRUE;
    ELSIF current_count < p_max_attempts THEN
        UPDATE rate_limits
        SET count = count + 1
        WHERE identifier = p_identifier
        AND action = p_action
        AND window_start = window_start;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

## 📚 Complete Implementation Example

\`\`\`tsx
// app/auth/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { PasswordReset } from "@/components/auth/password-reset"
import { SocialLogin } from "@/components/auth/social-login"
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary"
import { AuthService } from "@/lib/auth/supabase-auth"
import { useToast } from "@/hooks/use-toast"

type AuthMode = "login" | "register" | "reset"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [resetEmail, setResetEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (email: string, password: string) => {
    const result = await AuthService.login(email, password)
    
    if (result.success) {
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })
      router.push("/dashboard")
    }
    
    return result
  }

  const handleRegister = async (data: {
    email: string
    password: string
    confirmPassword: string
    fullName: string
  }) => {
    const result = await AuthService.register(data.email, data.password, data.fullName)
    
    if (result.success) {
      toast({
        title: "회원가입 성공",
        description: "이메일을 확인하여 계정을 활성화해주세요.",
      })
    }
    
    return result
  }

  const handlePasswordReset = async (email: string) => {
    const result = await AuthService.resetPassword(email)
    
    if (result.success) {
      toast({
        title: "재설정 링크 전송",
        description: "이메일을 확인해주세요.",
      })
    }
    
    return result
  }

  const handleGoogleLogin = async () => {
    return await AuthService.loginWithGoogle()
  }

  const handleForgotPassword = (email: string) => {
    setResetEmail(email)
    setMode("reset")
  }

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md space-y-6">
          {mode === "login" && (
            <>
              <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setMode("register")}
                onForgotPassword={handleForgotPassword}
              />
              <SocialLogin onGoogleLogin={handleGoogleLogin} />
            </>
          )}

          {mode === "register" && (
            <>
              <RegisterForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setMode("login")}
              />
              <SocialLogin onGoogleLogin={handleGoogleLogin} />
            </>
          )}

          {mode === "reset" && (
            <PasswordReset
              onResetPassword={handlePasswordReset}
              onBackToLogin={() => setMode("login")}
              initialEmail={resetEmail}
            />
          )}
        </div>
      </div>
    </AuthErrorBoundary>
  )
}
\`\`\`

## 🎯 Best Practices Summary

### 1. **Authentication Best Practices**
- Use strong password policies
- Implement proper session management
- Add rate limiting to prevent brute force attacks
- Use secure, httpOnly cookies for session storage
- Implement proper logout functionality

### 2. **Authorization Best Practices**
- Use role-based access control (RBAC)
- Implement principle of least privilege
- Validate permissions on both client and server
- Use middleware for route protection
- Audit user actions and access

### 3. **Security Best Practices**
- Sanitize all user inputs
- Use HTTPS in production
- Implement CSRF protection
- Add security headers
- Regular security audits and updates

### 4. **User Experience Best Practices**
- Provide clear error messages
- Implement loading states
- Use progressive enhancement
- Support keyboard navigation
- Ensure mobile responsiveness

### 5. **Development Best Practices**
- Use TypeScript for type safety
- Implement comprehensive error handling
- Write unit and integration tests
- Use environment variables for configuration
- Follow consistent coding standards

This comprehensive guide provides everything needed to implement secure, user-friendly authentication and authorization in Next.js applications. The examples are production-ready and follow industry best practices for security and user experience.
