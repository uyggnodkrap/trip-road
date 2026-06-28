@AGENTS.md

## WORKFLOW.md 갱신 규칙

**모든 작업이 끝난 후 반드시 `WORKFLOW.md`를 갱신한다.**

형식:
```
**[프롬프트]** 사용자가 입력한 프롬프트 그대로

**[작업]** 수행한 작업 요약
```

규칙:
- 프롬프트는 수정 없이 원문 그대로 기록
- 작업은 핵심만 간결하게 요약
- 날짜가 바뀌면 `## YYYY-MM-DD` 헤더 추가
- 파일 하단에 이어서 추가 (덮어쓰지 않음)

## 프로젝트 개요

여행 일정 계획 웹 앱 (반응형, 모바일 우선)

## 기술 스택

- Framework: Next.js (App Router)
- Styling: Tailwind CSS + shadcn/ui
- Auth: Supabase Auth (이메일 로그인)
- DB: Supabase

## 페이지 구성

- `/` — 여행 목록 홈
- `/trips/new` — 새 여행 생성
- `/trips/[id]` — 여행 상세 (날짜별 일정)
