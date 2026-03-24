# SmartHire

AI-powered recruitment platform that helps recruiters post jobs, screen candidates, and manage the full hiring pipeline — all in one place.

**Live:** [smarthire.website](https://smarthire.website)

---

## What it does

**For Recruiters**
- Post and manage job listings
- Review applications with AI-generated resume scores
- Shortlist, schedule interviews, reject, or hire candidates
- Track analytics across all job postings

**For Candidates**
- Browse and apply to open positions
- Track application status in real time
- Auto-fill applications from a saved profile
- Score your own resume against any job description

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini |
| Email | Resend |
| Animations | Framer Motion |
| Data Fetching | TanStack Query |
| Deployment | Vercel |

---

## Architecture

- **App Router** with server and client components
- **Role-based access** — recruiter and candidate flows are fully separated at the route and API level
- **Optimistic UI** via TanStack Query mutations with cache invalidation
- **AI resume scoring** — resume PDF is parsed and scored against the job description using Gemini
- **Transactional emails** sent on application status changes (shortlisted, interview scheduled, hired, rejected)

---

## License

MIT
