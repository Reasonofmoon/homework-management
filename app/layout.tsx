import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { SupabaseProvider } from "@/components/providers/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "학생 숙제 관리 시스템 - Reason of Moon",
  description: "구글 시트와 연동하여 학생별 숙제를 효율적으로 관리하는 시스템",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
