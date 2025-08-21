import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AboutUs from "@/components/AboutUs";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import Divider from "@/components/Divider";

const Index = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Services />
        <Divider />
        <AboutUs />
        <Divider />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;