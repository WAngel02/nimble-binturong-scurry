import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Contáctanos</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center">
                <MapPin className="h-10 w-10 text-primary mb-4" />
              </div>
              <CardTitle>Nuestra Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Calle Falsa 123, Ciudad, País
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center">
                <Phone className="h-10 w-10 text-primary mb-4" />
              </div>
              <CardTitle>Teléfono</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                +1 (555) 123-4567
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center">
                <Mail className="h-10 w-10 text-primary mb-4" />
              </div>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                contacto@vitalis.com
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Horario de Atención</h3>
            <p className="text-gray-600 text-lg">Lunes a Viernes: 9:00 AM - 5:00 PM</p>
            <p className="text-gray-600 text-lg">Sábados: 9:00 AM - 1:00 PM</p>
            <p className="text-gray-600 text-lg">Domingos: Cerrado</p>
            <div className="mt-8">
                <Link to="/agendar-cita">
                    <Button size="lg">Agenda tu cita ahora</Button>
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;