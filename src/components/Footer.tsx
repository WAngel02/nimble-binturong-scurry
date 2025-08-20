const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} Centro Médico Vitalis. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;