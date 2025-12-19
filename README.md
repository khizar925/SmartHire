<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Smart Hire - AI-Powered Recruitment

This is a Next.js application migrated from the original React + Vite setup. It's a modern landing page for an AI-powered recruitment management system.

## 🚀 Run Locally

**Prerequisites:** Node.js 18+ (recommended)

### Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables (optional):**
   Create a `.env.local` file in the root directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   *Note: This is optional for the landing page, but may be needed if you add API features later.*

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📁 Project Structure

```
smart-hire/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
├── types.ts           # TypeScript types
└── ...
```

## ✨ Features

- Modern, responsive design
- Smooth animations and transitions
- SEO-friendly (Next.js SSR)
- Optimized images (Next.js Image component)
- TypeScript for type safety

## 🔐 Role-based access (Clerk)

- Roles: `candidate`, `recruiter`, `admin` (admin is manual-only).
- New signups are redirected to `/onboarding/role` to pick Candidate/Recruiter once; the choice is locked via Clerk public metadata.
- Middleware redirects users to the right dashboard (`/candidate`, `/recruiter`, `/admin`) and blocks cross-role access.
- A lightweight `data/users.json` store keeps `clerkUserId`, `email`, and `role` in sync; replace with Postgres later.
- Admin provisioning: set `publicMetadata.role = "admin"` in the Clerk dashboard for trusted users; there is no self-promotion path.
- Smoke checks: hit `/api/admin` (expects 200 for admin, 403 otherwise) and sign in as each role to confirm dashboard routing.

## 📝 Notes

- All components are client components (use 'use client' directive)
- Images are optimized using Next.js Image component
- Tailwind CSS is properly configured (not via CDN)
- The app uses the App Router architecture
