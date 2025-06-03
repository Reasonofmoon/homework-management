import ProductionAuthTest from "@/components/production-auth-test"

export default function ProductionDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">프로덕션 환경 인증 테스트</h1>
      <ProductionAuthTest />
    </div>
  )
}
