import Navbar from '../components/navbar/Navbar';
import Hero from '../components/hero/Hero';
import TechLoop from '../components/techloop/TechLoop';
import About from '../components/about/About';
import Education from '../components/education/Education';
import Projects from '../components/projects/Projects';
import Contact from '../components/contact/Contact';
import Footer from '../components/footer/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TechLoop />
      <About />
      <Education />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
