import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AboutUs from "@/components/AboutUs";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Services />
        <AboutUs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;