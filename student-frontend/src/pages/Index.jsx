import Navbar from "@/components/Navbar.jsx";
import Hero from "@/components/Hero.jsx";
import CTACards from "@/components/CTACards.jsx";
import Achievements from "@/components/Achievements.jsx";
import OurToppers from "@/components/OurToppers.jsx";
import Courses from "@/components/Courses.jsx";
import Methodology from "@/components/Methodology.jsx";
import BatchPrograms from "@/components/BatchPrograms.jsx";
import Footer from "@/components/Footer.jsx";

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CTACards />
      <Achievements />
      <OurToppers />
      <Courses />
      <Methodology />
      <BatchPrograms />
      <Footer />
    </div>
  );
}

export default Index;
