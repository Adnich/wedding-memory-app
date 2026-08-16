This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Resumable wedding-media uploads

The guest uploader uses Google Drive resumable sessions for every media file.
Cloud Run creates and verifies each single-file session with server-side OAuth;
the browser sends the unchanged file bytes directly to Drive in 8 MiB chunks.
Multer and Cloud Run are not in the media-byte path.

- Per-file limit: 1 GiB, exactly 1,073,741,824 bytes.
- Submission limit: 100 files across all picker additions.
- Memory bound: one 8 MiB `Blob.slice()` is in flight at a time; the complete file
  is never read into browser JavaScript or backend memory.
- Ordering: stable ascending file size, with concurrency set to one.
- Retries: one first pass over every file, followed by at most two file-level
  retry passes for failures only. Resumable status checks recover confirmed bytes
  within an active attempt.
- Persistence: every file is complete in Drive before the next file starts.
- Metadata: Sheets is updated only after Drive completion is verified. A Sheets
  failure is logged separately and never changes Drive success into upload failure.
- Duplicate protection: Drive pre-generated file IDs and resumable session status
  checks are reused across retries before any replacement session is initialized.
- Original quality: no image or video bytes are resized, compressed, converted, or
  transcoded.

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
