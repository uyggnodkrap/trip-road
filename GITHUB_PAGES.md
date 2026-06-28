# GitHub Pages 배포 가이드

## ⚠️ 주의사항

이 앱은 **Next.js SSR + Supabase 미들웨어(인증)**를 사용하기 때문에  
GitHub Pages(정적 파일 전용 호스팅)에 그대로 배포할 수 없습니다.

GitHub Pages에 배포하려면 앱 전체를 정적 방식으로 재작성해야 합니다.

---

## ✅ 권장: Vercel 배포 (5분)

Next.js 공식 호스팅 서비스로 추가 설정 없이 바로 배포됩니다.

### 1단계 — Vercel 계정 생성
- [vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인

### 2단계 — 프로젝트 import
1. 대시보드에서 **Add New → Project** 클릭
2. GitHub 저장소 `trip-road` 선택 후 **Import**

### 3단계 — 환경변수 설정
**Environment Variables** 섹션에 아래 두 값을 입력:

```
NEXT_PUBLIC_SUPABASE_URL     = https://snnldfqbutnekqjnkwum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (Supabase anon key)
```

### 4단계 — 배포
**Deploy** 버튼 클릭 → 1~2분 후 `https://trip-road-xxx.vercel.app` 주소 발급

### 이후 업데이트
`main` 브랜치에 push할 때마다 자동으로 재배포됩니다.

---

## GitHub Pages로 배포하려면 (고난이도)

앱을 정적 내보내기(Static Export)로 전환해야 합니다.  
아래 변경이 모두 필요합니다:

1. `next.config.ts`에 `output: 'export'` 추가
2. 서버 컴포넌트 → 클라이언트 컴포넌트로 전환 (모든 Supabase 호출)
3. 인증 미들웨어 제거 → 클라이언트 사이드 인증 처리로 교체
4. 동적 라우트(`/trips/[id]`) 처리 방식 변경
5. GitHub Actions 워크플로우 추가

> 재작성 공수가 크므로 **Vercel 사용을 강력히 권장**합니다.
