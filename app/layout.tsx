import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { HelpButton } from "@/components/help-button"
import { LocalModeBanner } from "@/components/local-mode-banner"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "학생 숙제 관리 시스템 - Reason of Moon",
  description: "구글 시트와 연동하여 학생별 숙제를 효율적으로 관리하는 시스템",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-950">
              <div className="container flex h-16 items-center px-2 sm:px-4">
                <MainNav />
                <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
                  <HelpButton />
                  <ModeToggle />
                  <UserNav />
                </div>
              </div>
            </header>
            <div className="container px-4 py-4">
              <LocalModeBanner />
              {children}
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'