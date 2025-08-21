import { Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl rounded-lg bg-white/70 backdrop-blur-lg shadow-premium-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <Hospital className="h-8 w-8 text-primary" />
            <span className="ml-3 text-xl font-bold text-primary">Centro Médico Vitalis</span>
          </Link>
          <nav className="hidden md:flex md:space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Inicio</Link>
            <a href="/#services" className="text-gray-600 hover:text-gray-900 font-medium">Servicios</a>
            <a href="/#about-us" className="text-gray-600 hover:text-gray-900 font-medium">Sobre Nosotros</a>
            <a href="/#contact" className="text-gray-600 hover:text-gray-900 font-medium">Contacto</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/agendar-cita">
              <Button>Agendar Cita</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;