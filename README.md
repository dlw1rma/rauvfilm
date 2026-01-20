This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cloudtype 배포 필수 환경변수 (중요)

Cloudtype는 `.env` 파일을 자동으로 읽지 않으므로, **Cloudtype 서비스 설정에서 환경변수를 직접 등록**해야 합니다.

- **필수**
  - `DATABASE_URL`: PostgreSQL 연결 문자열 (Prisma가 사용)
- **권장**
  - `ADMIN_PASSWORD`: 관리자 로그인 비밀번호 (기본값 사용 금지)
  - `SESSION_SECRET`: 세션 시크릿 (기본값 사용 금지)

### 헬스 체크

배포 후 아래 엔드포인트로 환경변수/DB 연결 상태를 확인할 수 있습니다.

- `GET /api/health`
