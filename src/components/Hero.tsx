import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-secondary py-20 text-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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