import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportImportData } from "@/components/export-import-data"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">설정</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ExportImportData />

        <Card>
          <CardHeader>
            <CardTitle>애플리케이션 정보</CardTitle>
            <CardDescription>애플리케이션 버전 및 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">버전</span>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">최종 업데이트</span>
                <span className="text-sm text-muted-foreground">2025년 3월 24일</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">실행 모드</span>
                <span className="text-sm text-muted-foreground" id="run-mode">
                  {/* This will be filled by client-side JavaScript */}
                  확인 중...
                </span>
              </div>

              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  document.addEventListener('DOMContentLoaded', function() {
                    const runModeElement = document.getElementById('run-mode');
                    if (runModeElement) {
                      const isLocal = window.location.protocol === 'file:';
                      runModeElement.textContent = isLocal ? '로컬 모드' : '웹 모드';
                    }
                  });
                `,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

