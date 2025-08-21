import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="bg-secondary pt-20 pb-28 text-center overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-primary/10"
        style={{ transform: `translateY(${offsetY * 0.3}px)` }}
      ></div>
      <div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative"
        style={{ transform: `translateY(${offsetY * 0.5}px)` }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
          Cuidamos de ti y tu familia
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Ofrecemos atención médica integral con un equipo de especialistas comprometidos con tu bienestar.
        </p>
        <div className="mt-8">
          <Link to="/agendar-cita">
            <Button size="lg">Agenda tu cita ahora</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;