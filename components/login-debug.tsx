"use client"

import type { Session, User } from "@supabase/supabase-js"

interface LoginDebugProps {
  email: string
  password: string
  user: User | null
  session: Session | null
  redirectAttempts: number
}

export function LoginDebug({ email, password, user, session, redirectAttempts }: LoginDebugProps) {
  return (
    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
      <h4 className="font-bold mb-1">디버그 정보:</h4>
      <div>이메일: {email}</div>
      <div>비밀번호 길이: {password.length}</div>
      <div>환경: {process.env.NODE_ENV}</div>
      <div>현재 경로: {typeof window !== "undefined" ? window.location.pathname : "unknown"}</div>
      <div>리다이렉트 시도: {redirectAttempts}회</div>

      <h4 className="font-bold mt-2 mb-1">사용자 정보:</h4>
      <div>로그인 상태: {user ? "로그인됨" : "로그인되지 않음"}</div>
      {user && (
        <>
          <div>사용자 ID: {user.id}</div>
          <div>이메일: {user.email}</div>
          <div>생성일: {new Date(user.created_at).toLocaleString()}</div>
        </>
      )}

      <h4 className="font-bold mt-2 mb-1">세션 정보:</h4>
      <div>세션 상태: {session ? "활성" : "비활성"}</div>
      {session && (
        <>
          <div>만료일: {new Date(session.expires_at * 1000).toLocaleString()}</div>
          <div>만료 여부: {Date.now() > session.expires_at * 1000 ? "만료됨" : "유효함"}</div>
        </>
      )}
    </div>
  )
}
