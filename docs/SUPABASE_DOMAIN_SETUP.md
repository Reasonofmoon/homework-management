# Supabase 도메인 설정 가이드

## 🎯 목표
Vercel에 배포된 앱에서 Supabase 인증이 작동하도록 도메인을 설정합니다.

## 📋 현재 상황
- ✅ Vercel 환경 변수 설정 완료
- ❓ Supabase 도메인 설정 확인 필요
- ❓ 사용자 계정 상태 확인 필요

## 🔧 단계별 설정

### 1. Supabase 대시보드 접속
\`\`\`
https://supabase.com/dashboard/project/gvtegncddn
\`\`\`

### 2. Authentication 설정
1. 좌측 메뉴에서 **Authentication** 클릭
2. **URL Configuration** 클릭

### 3. Site URL 설정
\`\`\`
Site URL: https://v0-student-homework-app.vercel.app
\`\`\`

### 4. Redirect URLs 설정
다음 URL들을 모두 추가:
\`\`\`
https://v0-student-homework-app.vercel.app/**
https://v0-student-homework-app.vercel.app/auth/callback
https://v0-student-homework-app.vercel.app/auth/login
https://v0-student-homework-app-git-main-reasonofmoons-projects.vercel.app/**
https://v0-student-homework-7vwq5u1q3-reasonofmoons-projects.vercel.app/**
\`\`\`

### 5. 사용자 계정 확인
1. **Authentication** → **Users** 클릭
2. `soundfury37@gmail.com` 계정 확인
3. 계정이 없다면 생성 필요

## 🔍 문제 진단 체크리스트

### Supabase 설정 확인
- [ ] Site URL이 정확한 도메인으로 설정됨
- [ ] Redirect URLs에 모든 Vercel 도메인 포함
- [ ] Email confirmation이 활성화됨 (필요시)
- [ ] Rate limiting 설정 확인

### 사용자 계정 확인
- [ ] soundfury37@gmail.com 계정 존재
- [ ] 이메일 확인 완료 (Email Confirmed)
- [ ] 계정이 활성화됨 (Active)
- [ ] 비밀번호가 설정됨

### 네트워크 및 보안
- [ ] HTTPS 사용 (HTTP는 지원 안됨)
- [ ] CORS 설정 확인
- [ ] 브라우저 쿠키 설정 확인

## 🛠️ 문제별 해결 방법

### 문제 1: "Invalid login credentials"
**원인**: 사용자 계정이 없거나 비밀번호가 틀림
**해결**: 
1. Supabase Users에서 계정 확인
2. 계정이 없다면 회원가입 진행
3. 비밀번호 재설정 시도

### 문제 2: "Email not confirmed"
**원인**: 이메일 인증이 완료되지 않음
**해결**:
1. Supabase Users에서 Email Confirmed 상태 확인
2. 수동으로 이메일 확인 처리
3. 이메일 재전송

### 문제 3: "Signup disabled"
**원인**: 회원가입이 비활성화됨
**해결**:
1. Authentication → Settings에서 Enable email signup 확인
2. 필요시 활성화

### 문제 4: CORS 오류
**원인**: 도메인이 허용 목록에 없음
**해결**:
1. URL Configuration에서 모든 도메인 추가
2. 와일드카드(*) 사용 고려

## 🚀 테스트 방법

### 1. 환경 변수 테스트
\`\`\`
https://v0-student-homework-app.vercel.app/debug/vercel-env
\`\`\`

### 2. 실제 로그인 테스트
\`\`\`
https://v0-student-homework-app.vercel.app/auth/login
\`\`\`

### 3. 회원가입 테스트 (필요시)
\`\`\`
https://v0-student-homework-app.vercel.app/auth/signup
\`\`\`

## 📞 추가 지원

문제가 지속되면:
1. 브라우저 개발자 도구에서 Network 탭 확인
2. Supabase 대시보드에서 Auth 로그 확인
3. Vercel 함수 로그 확인

## 🔒 보안 참고사항

- Site URL은 정확한 프로덕션 도메인만 설정
- 개발 환경과 프로덕션 환경 분리 고려
- API 키는 절대 클라이언트에 노출하지 않음
