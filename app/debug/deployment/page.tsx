import DeploymentDebug from "@/components/deployment-debug"

export default function DeploymentDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">배포 환경 진단</h1>
      <DeploymentDebug />
    </div>
  )
}
