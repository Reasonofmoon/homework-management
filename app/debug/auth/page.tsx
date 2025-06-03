import AuthDebug from "@/components/auth-debug"

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">인증 시스템 진단</h1>
      <AuthDebug />
    </div>
  )
}
