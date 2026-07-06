# Markdown to PDF

Markdown을 작성하고, 렌더링 결과를 실시간으로 확인한 뒤, PDF에 맞는
스타일을 조정해서 최종 문서를 PDF로 내보내는 Next.js 웹 애플리케이션입니다.

첫 번째 지원 문서 유형은 개발 문서입니다. 현재 렌더러는 제목, 목록, 표,
코드 블록, 링크, 업로드 이미지, 한국어 텍스트, 에디터에서 입력한 줄바꿈을
검증 대상으로 삼고 있습니다.

## 현재 상태

MVP 구현과 검증이 완료된 상태입니다.

구현된 기능:

- Markdown 편집기와 실시간 문서 미리보기
- `react-markdown`과 GitHub Flavored Markdown 기반의 공통 미리보기/내보내기 렌더러
- 본문 글자 크기, 줄 높이, 페이지 크기, 페이지 여백, 코드 블록 글자 크기 조정
- Markdown에서 파일명으로 참조할 수 있는 이미지 업로드
- Node.js Next.js API Route와 Playwright를 이용한 PDF 내보내기
- 잘못된 입력, 누락된 이미지, 내보내기 실패에 대한 명확한 UI 메시지
- PDF 페이지 나눔을 미리 확인할 수 있는 페이지 경계 가이드
- 반복 Enter 공백, hard break, `<br>` 태그, 제목, 표, 목록-제목 전환 구간의 줄바꿈 보존

## 기술 스택

- Next.js App Router
- TypeScript
- React
- Playwright: PDF 생성 및 E2E 테스트
- Vitest, Testing Library: 단위 및 컴포넌트 테스트
- CSS Modules와 문서 전용 CSS 변수
- Zod: 런타임 문서 검증

## 시작하기

의존성을 설치합니다.

```bash
npm install
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:3000
```

Playwright 브라우저가 설치되어 있지 않다면 Chromium을 설치합니다.

```bash
npx playwright install chromium
```

배포 환경에서 export 페이지를 열 origin을 명시해야 한다면 `APP_ORIGIN`을
설정합니다. 값은 `http` 또는 `https` URL이어야 합니다.

```bash
APP_ORIGIN=https://example.com
```

## 사용 방법

1. 왼쪽 패널에서 Markdown을 작성하거나 붙여 넣습니다.
2. 가운데 패널에서 렌더링된 문서를 확인합니다.
3. 오른쪽 패널에서 PDF 스타일 설정을 조정합니다.
4. 이미지가 필요하면 로컬 이미지 파일을 업로드한 뒤 Markdown에서 파일명으로 참조합니다.
5. `Export PDF` 버튼을 눌러 PDF 파일을 다운로드합니다.

MVP에서는 문서 상태를 브라우저 메모리에만 보관합니다. 사용자 계정, 저장된
문서, 클라우드 저장소는 아직 포함하지 않습니다.

## 프로젝트 구조

```text
.
|-- docs/                  # 제품 설계와 구현 계획 문서
|-- harness/               # 세션 상태, 기능 목록, 다음 작업 인계 기록
|-- public/                # Next.js scaffold 정적 자산
|-- src/
|   |-- app/               # Next.js App Router 페이지와 API Route
|   |   |-- api/export/    # PDF 내보내기 API Route
|   |   |-- export/        # Playwright가 렌더링하는 내부 내보내기 페이지
|   |   `-- page.tsx       # 메인 편집기/미리보기 애플리케이션
|   |-- components/        # 편집기, 미리보기, 렌더러, 스타일, 이미지, 내보내기 UI
|   |-- lib/
|   |   |-- document/      # 문서 모델, 검증, 스타일, 자산, 줄바꿈 처리
|   |   `-- export/        # PDF 생성, 저장소, 파일명 helper
|   `-- test/              # Vitest 설정
`-- tests/
    |-- e2e/               # Playwright 브라우저 워크플로 테스트
    `-- unit/              # Vitest 단위 및 렌더러 테스트
```

주요 파일:

- `src/app/page.tsx`: 메인 브라우저 애플리케이션 shell
- `src/components/DocumentRenderer.tsx`: 미리보기와 내보내기가 공유하는 Markdown 렌더러
- `src/app/api/export/route.ts`: PDF 내보내기 엔드포인트
- `src/lib/export/pdf.ts`: Playwright PDF 렌더링 helper
- `src/lib/export/origin.ts`: PDF export origin 결정 helper
- `src/lib/export/errors.ts`: PDF export 오류 응답 분류 helper
- `src/lib/document/lineBreaks.ts`: Markdown 줄바꿈 보존 로직
- `harness/progress-log.md`: 검증된 프로젝트 상태의 기준 문서

## 스크립트

```bash
npm run dev       # 로컬 개발 서버 실행
npm run build     # production build 생성
npm run start     # build 이후 production 서버 실행
npm run lint      # ESLint 실행
npm run test      # Vitest 테스트 실행
npm run test:e2e  # Playwright E2E 테스트 실행
```

## 검증

표준 검증 경로:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

최신 전체 검증 증거는 `harness/progress-log.md`와
`harness/feature-list.json`에 기록합니다.

## 문서

활성 프로젝트 문서:

- `docs/README.md`
- `docs/markdown-to-pdf-web-app-design.md`
- `docs/markdown-to-pdf-web-app-implementation-plan.md`

참고용 과거 문서:

- `docs/markdown-to-pdf-cli-design.md`

CLI 방향은 현재 웹 애플리케이션 방향으로 대체되었습니다.
