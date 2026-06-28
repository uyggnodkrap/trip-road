# Workflow Log

## 2026-06-28

---

**[프롬프트]** 여행 일정 계획 앱을 만들고 싶어

**[작업]** 앱 유형(웹/모바일) 질문으로 요구사항 수집 시작

---

**[프롬프트]** 웹 앱인데, 모바일에서도 많이 사용할거야

**[작업]** 반응형 웹 앱으로 확정. 협업 여부 질문

---

**[프롬프트]** 1인 사용자

**[작업]** 1인 사용자 확정. 핵심 흐름 질문

---

**[프롬프트]** 추천대로..!

**[작업]** 핵심 흐름 확정: 여행 생성 → 날짜 범위 설정 → 날짜별 장소/활동 추가. 일정 항목 필드 질문

---

**[프롬프트]** 장소 이름이랑 시간, 메모만

**[작업]** 일정 항목 필드 확정(장소 이름, 시간, 메모). 데이터 저장 방식 질문

---

**[프롬프트]** supabase에 저장할거야. api랑 key는 나중에 개발하면서 알려줄게

**[작업]** Supabase 저장 확정. 프론트엔드 프레임워크 질문

---

**[프롬프트]** 추천대로

**[작업]** Next.js 확정. 스타일링 방식 질문

---

**[프롬프트]** 추천대로

**[작업]** Tailwind CSS + shadcn/ui 확정. 페이지 구성 질문

---

**[프롬프트]** 아니 없어

**[작업]** 페이지 3개 확정(`/`, `/trips/new`, `/trips/[id]`). 인증 방식 질문

---

**[프롬프트]** 단순 email 로그인/인증만 사용할거야

**[작업]** 이메일 인증 확정. DB 스키마 제안(trips, itinerary_items)

---

**[프롬프트]** 좋아, 이걸로 개발 시작하자

**[작업]** 프로젝트 전체 초기 세팅 완료
- `create-next-app` + TypeScript + Tailwind + App Router
- shadcn/ui 초기화 및 컴포넌트 설치(card, input, label, textarea, dialog, badge, separator)
- Supabase 패키지 설치 및 클라이언트/서버/미들웨어 설정
- 이메일 로그인 페이지(`/login`)
- 여행 목록 홈(`/`)
- 새 여행 생성(`/trips/new`)
- 여행 상세 + 날짜별 일정(`/trips/[id]`)
- 일정 추가/수정/삭제 컴포넌트
- `supabase-schema.sql` (RLS 포함)
- 빌드 통과 확인

---

**[프롬프트]** 키와 url 확인하는 방법 알려줘

**[작업]** Supabase 대시보드 → Settings → Data API에서 Project URL과 anon key 확인 방법 안내

---

**[프롬프트]** 프로젝트url 어디서 확인해?

**[작업]** Data API 페이지 상단 "Project URL" 섹션 위치 재안내

---

**[프롬프트]** https://snnldfqbutnekqjnkwum.supabase.co/rest/v1/

**[작업]** `/rest/v1/` 경로 제거 후 정확한 Project URL 안내 및 anon key 요청

---

**[프롬프트]** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**[작업]** `.env.local`에 Supabase URL과 anon key 입력 완료

---

**[프롬프트]** 앞으로 내가 입력한 프롬프트와 이에 상응해서 네가 한 작업을 정리해서 WORKFLOW.md로 저장해줘. 프롬프트는 수정하지 않고 그대로 작성되어야 하고, 작업은 요약해서 작성해주면 돼. 이내용을 CLAUDE.md 에 반영해서 앞으로는 작업 시 항상 WORKFLOW.md를 갱신하게 해줘

**[작업]** WORKFLOW.md 생성(현재까지 대화 전체 기록), CLAUDE.md에 WORKFLOW.md 갱신 규칙 반영

---

**[프롬프트]** 여행 제목 변경할 수 있도록 해줘

**[작업]** `EditableTripTitle` 컴포넌트 생성 — 헤더의 제목 클릭 시 인라인 input으로 전환, Enter/blur 시 Supabase 업데이트, Escape 시 원래 제목 복원. `/trips/[id]/page.tsx` 헤더에 적용

---

**[프롬프트]** https://github.com/uyggnodkrap/trip-road.git 에 커밋하고 푸시해줘

**[작업]** remote 추가 후 전체 소스 커밋(`.env.local` 제외), main 브랜치 푸시 완료

---

**[프롬프트]** github page에 배포하고싶은데 방법 알려주고 GITHUP_PAGES.md 파일로 만들어줘

**[작업]** `GITHUB_PAGES.md` 생성 — GitHub Pages는 SSR/미들웨어 미지원으로 직접 배포 불가함을 안내, Vercel 5분 배포 방법(환경변수 포함) 및 GitHub Pages로 전환 시 필요한 리팩터링 목록 정리
