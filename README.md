# 머니장부

한국 금융 계산기 모음 사이트 (Astro, 정적 HTML 빌드). 퇴직금·대출·예금·연봉 실수령액·연말정산·실업급여·취득세·육아휴직급여 8종 계산기를 제공합니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm install` | 의존성 설치 |
| `npm run dev` | 로컬 개발 서버 (`localhost:4321`) |
| `npm test` | `src/lib` 계산 로직 단위 테스트 (Node 내장 test runner) |
| `npm run build` | `dist/`로 정적 빌드 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |

## 구조

- `src/lib/` — 계산기별 순수 계산 함수 + 단위 테스트(`*.test.js`)
- `src/data/rates.js` — 2026년 기준 요율·한도액 (요율 개정 시 이 파일만 수정)
- `src/data/calculators-meta.js` — 계산기 목록 메타 정보 (홈/관련 링크에서 공용)
- `src/components/` — 공통 UI(장부 카드, 결과 스탬프, 광고 슬롯, FAQ, 관련 링크 등)
- `src/pages/` — 계산기별 라우트 (`/severance/`, `/loan/` 등)

## 배포 (Cloudflare Pages)

1. GitHub 원격 저장소에 push
2. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git → 이 저장소 선택
3. 빌드 설정: Build command `npm run build`, Build output directory `dist`, Node 버전 22
4. Pages 프로젝트 → Custom domains에서 `calcbank.kr` 추가 (도메인 네임서버가 Cloudflare로 되어 있어야 함)
5. `astro.config.mjs`의 `site`는 이미 `https://calcbank.kr`로 설정되어 있음 — 도메인이 바뀌면 이 값과 `public/robots.txt`의 sitemap URL을 함께 교체

## 기타 확인할 것

- `src/data/rates.js`에 적어둔 출처 주석을 참고해 요율이 매년 바뀌는지 확인
- 애드센스 승인 후에는 `src/components/AdSlot.astro`의 플레이스홀더를 실제 광고 코드로 교체하고, `public/ads.txt`에 퍼블리셔 ID를 추가
