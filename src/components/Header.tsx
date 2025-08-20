import { Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Hospital className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-primary">Centro Médico Vitalis</span>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <a href="#" className="text-gray-500 hover:text-gray-900">Inicio</a>
            <a href="#services" className="text-gray-500 hover:text-gray-900">Servicios</a>
            <a href="#" className="text-gray-500 hover:text-gray-900">Sobre Nosotros</a>
            <a href="#" className="text-gray-500 hover:text-gray-900">Contacto</a>
          </nav>
          <Button>Agendar Cita</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;