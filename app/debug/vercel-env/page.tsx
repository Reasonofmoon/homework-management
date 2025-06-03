import VercelEnvValidator from "@/components/vercel-env-validator"

export default function VercelEnvPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Vercel 환경 변수 검증</h1>
      <VercelEnvValidator />
    </div>
  )
}
