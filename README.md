# Smart Hire - AI-Powered Recruitment

A modern, AI-powered recruitment management system landing page built with Next.js. This application provides a comprehensive platform for automating and optimizing the hiring process.

## 📋 Description

Smart Hire is an advanced recruitment management system that leverages AI to streamline the hiring process. The application features a beautiful, responsive landing page with authentication capabilities, showcasing features, pricing, and user testimonials.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Smart-Hire
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Configure your Clerk authentication keys in the `.env` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Image Optimization:** Next.js Image component

## 📁 Project Structure

```
Smart-Hire/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── signin/            # Sign in page
│   └── signup/            # Sign up page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Hero.tsx           # Hero section
│   ├── Features.tsx       # Features section
│   ├── ProblemSolution.tsx # Problem/Solution section
│   ├── Users.tsx          # Users section
│   ├── Stats.tsx          # Statistics section
│   ├── Pricing.tsx        # Pricing section
│   ├── CTA.tsx            # Call-to-action section
│   ├── Footer.tsx         # Footer component
│   └── Button.tsx         # Reusable button component
├── types.ts               # TypeScript type definitions
├── metadata.json          # Project metadata
└── tailwind.config.ts     # Tailwind CSS configuration
```

## ✨ Features

- **Modern Landing Page:**
  - Responsive design for all devices
  - Smooth animations and transitions
  - Hero section with call-to-action
  - Features showcase
  - Problem/Solution presentation
  - User testimonials
  - Pricing plans
  - Statistics display

- **Authentication:**
  - User sign-in and sign-up pages
  - Clerk-powered authentication
  - Secure session management

- **Performance & SEO:**
  - Server-side rendering (SSR)
  - Optimized images with Next.js Image component
  - SEO-friendly metadata
  - Fast page loads

- **Developer Experience:**
  - TypeScript for type safety
  - Component-based architecture
  - Tailwind CSS for styling
  - ESLint for code quality

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

Make sure to set up the following environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

## 📝 License

This project is private and proprietary.

