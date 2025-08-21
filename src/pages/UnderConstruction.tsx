import { HardHat } from 'lucide-react';

const UnderConstruction = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-md">
      <HardHat className="h-24 w-24 text-yellow-500 mb-6 animate-bounce" />
      <h1 className="text-3xl font-bold text-gray-800">Página en Construcción</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md">
        Nuestro equipo está trabajando arduamente para construir esta sección y ofrecerte nuevas funcionalidades.
      </p>
      <p className="mt-2 text-gray-500">
        ¡Agradecemos tu paciencia y te invitamos a volver pronto!
      </p>
    </div>
  );
};

export default UnderConstruction;