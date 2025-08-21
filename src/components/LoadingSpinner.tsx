const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;