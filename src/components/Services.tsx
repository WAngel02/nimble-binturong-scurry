import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Stethoscope, Smile, HeartPulse } from "lucide-react";

const services = [
  {
    icon: <Stethoscope className="h-10 w-10 text-primary mb-4" />,
    title: "Consulta General",
    description: "Atención primaria para todas las edades, diagnóstico y tratamiento de enfermedades comunes.",
  },
  {
    icon: <Smile className="h-10 w-10 text-primary mb-4" />,
    title: "Odontología",
    description: "Servicios dentales completos, desde limpiezas hasta tratamientos especializados.",
  },
  {
    icon: <HeartPulse className="h-10 w-10 text-primary mb-4" />,
    title: "Cardiología",
    description: "Prevención, diagnóstico y tratamiento de enfermedades del corazón y del sistema circulatorio.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Nuestros Servicios</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Atención médica de calidad para cada una de tus necesidades.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;