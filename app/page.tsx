import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { ProblemSolution } from '@/components/ProblemSolution';
import { UsersSection } from '@/components/Users';
import { Stats } from '@/components/Stats';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { Pricing } from '@/components/Pricing';

export default async function Home() {

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <ProblemSolution />
        <Features />
        <UsersSection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

