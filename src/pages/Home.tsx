import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Seo } from '@/components/Seo'
import { ScrollProgress } from '@/components/ScrollProgress'
import { BackToTop } from '@/components/BackToTop'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Projects } from '@/sections/Projects'
import { Certificates } from '@/sections/Certificates'
import { Testimonials } from '@/sections/Testimonials'
import { Contact } from '@/sections/Contact'

export default function Home() {
  return (
    <>
      <Seo />
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
