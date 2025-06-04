"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ClipboardList, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">학생 숙제 관리 시스템</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            효율적인 숙제 관리로 더 나은 교육 환경을 만들어보세요
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>클래스 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>클래스를 생성하고 학생들을 효율적으로 관리하세요</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>학생 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>학생을 등록하고 클래스에 배정하여 체계적으로 관리하세요</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <ClipboardList className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>숙제 배정</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>숙제를 생성하고 학생들에게 배정하여 학습을 관리하세요</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>진도 추적</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>학생들의 진도를 추적하고 성과를 평가하세요</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/login">로그인</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">회원가입</Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>시작하기</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                계정을 생성하여 클래스를 만들고, 학생들을 등록한 후 숙제를 배정해보세요. 직관적인 인터페이스로 쉽게 학습
                진도를 관리할 수 있습니다.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
