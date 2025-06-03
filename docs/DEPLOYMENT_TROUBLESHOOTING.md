# 배포 환경 로그인 문제 해결 가이드

## 🚨 문제 상황
Vercel 개발 환경(`vercel dev`)에서는 로그인이 되지만, 배포된 URL에서는 로그인이 안 되는 경우

## 🔍 주요 원인들

### 1. 환경 변수 누락 (가장 흔한 원인)
- **문제**: Vercel 배포 시 환경 변수가 설정되지 않음
- **해결**: Vercel 대시보드에서 환경 변수 설정

### 2. Supabase URL 설정 문제
- **문제**: Supabase에서 허용된 도메인이 설정되지 않음
- **해결**: Supabase 대시보드에서 Site URL 및 Redirect URLs 설정

### 3. 브라우저 캐시 문제
- **문제**: 이전 설정이 캐시되어 있음
- **해결**: 브라우저 캐시 클리어

## 🛠️ 단계별 해결 방법

### Step 1: Vercel 환경 변수 설정

1. **Vercel 대시보드 접속**
   \`\`\`
   https://vercel.com/dashboard
   \`\`\`

2. **프로젝트 선택 → Settings → Environment Variables**

3. **다음 환경 변수 추가:**
   \`\`\`
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   Environments: Production, Preview, Development
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environments: Production, Preview, Development
   \`\`\`

4. **재배포 실행**
   \`\`\`bash
   # 자동으로 재배포되거나 수동으로 재배포
   vercel --prod
   \`\`\`

### Step 2: Supabase 도메인 설정

1. **Supabase 대시보드 접속**
   \`\`\`
   https://app.supabase.com/project/your-project-id
   \`\`\`

2. **Authentication → URL Configuration**

3. **Site URL 설정:**
   \`\`\`
   https://your-app.vercel.app
   \`\`\`

4. **Redirect URLs 추가:**
   \`\`\`
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   \`\`\`

### Step 3: 진단 도구 사용

1. **배포된 사이트에서 진단 실행:**
   \`\`\`
   https://your-app.vercel.app/debug/deployment
   \`\`\`

2. **문제점 확인 및 해결**

## 🔧 환경 변수 확인 방법

### 로컬에서 확인:
\`\`\`bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

### Vercel에서 확인:
\`\`\`bash
vercel env ls
\`\`\`

## 📋 체크리스트

- [ ] Vercel 환경 변수 설정 완료
- [ ] 모든 환경(Production, Preview, Development)에 변수 적용
- [ ] Supabase Site URL 설정
- [ ] Supabase Redirect URLs 설정
- [ ] 재배포 완료
- [ ] 브라우저 캐시 클리어
- [ ] 진단 도구로 확인

## 🚀 추가 팁

### 1. 환경별 설정
\`\`\`javascript
// 환경별로 다른 Supabase 프로젝트 사용 시
const supabaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
  : process.env.NEXT_PUBLIC_SUPABASE_URL_DEV
\`\`\`

### 2. 디버그 모드 활성화
\`\`\`javascript
// 프로덕션에서 디버그 정보 확인
const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true'
\`\`\`

### 3. 로그 확인
\`\`\`bash
# Vercel 함수 로그 확인
vercel logs your-deployment-url
\`\`\`

## ⚠️ 보안 주의사항

1. **Service Role Key는 절대 클라이언트에 노출하지 마세요**
2. **환경 변수는 NEXT_PUBLIC_ 접두사 사용 시 클라이언트에 노출됩니다**
3. **민감한 정보는 서버 사이드에서만 사용하세요**

## 🆘 여전히 문제가 있다면

1. `/debug/deployment` 페이지에서 진단 결과 확인
2. Vercel 함수 로그 확인
3. Supabase 대시보드에서 Auth 로그 확인
4. 브라우저 개발자 도구에서 네트워크 탭 확인
\`\`\`

이제 진단 페이지를 추가해보겠습니다:
