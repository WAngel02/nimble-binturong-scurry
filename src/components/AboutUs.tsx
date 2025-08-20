import { Building, Users, HeartHandshake } from "lucide-react";

const AboutUs = () => {
  return (
    <section id="about-us" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Sobre Nosotros</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Comprometidos con la excelencia en el cuidado de la salud.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Misión</h3>
            <p className="text-gray-600 mb-6">
              En Centro Médico Vitalis, nuestra misión es proporcionar atención médica accesible, compasiva y de alta calidad para nuestra comunidad. Nos esforzamos por ser un centro de confianza donde los pacientes se sientan escuchados, respetados y cuidados en cada etapa de su vida.
            </p>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Visión</h3>
            <p className="text-gray-600">
              Aspiramos a ser líderes en innovación médica y bienestar, integrando tecnología de vanguardia con un enfoque humano y personalizado. Queremos construir un futuro más saludable para todos, promoviendo la prevención y la educación en salud como pilares fundamentales.
            </p>
          </div>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Building className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Instalaciones Modernas</h4>
                <p className="mt-1 text-gray-500">
                  Contamos con equipos de última generación y un ambiente cómodo y seguro para tu atención.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Equipo de Expertos</h4>
                <p className="mt-1 text-gray-500">
                  Nuestros profesionales están altamente calificados y en constante formación para ofrecerte el mejor servicio.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <HeartHandshake className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Atención Personalizada</h4>
                <p className="mt-1 text-gray-500">
                  Creemos en una relación médico-paciente basada en la confianza y la comunicación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;