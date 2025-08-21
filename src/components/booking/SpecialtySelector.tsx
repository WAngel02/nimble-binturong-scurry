import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Stethoscope, Smile, HeartPulse, Baby, Bone, Brain } from "lucide-react";

const services = [
  { name: "Consulta General", icon: <Stethoscope className="h-5 w-5 mr-2" /> },
  { name: "Odontología", icon: <Smile className="h-5 w-5 mr-2" /> },
  { name: "Cardiología", icon: <HeartPulse className="h-5 w-5 mr-2" /> },
  { name: "Pediatría", icon: <Baby className="h-5 w-5 mr-2" /> },
  { name: "Traumatología", icon: <Bone className="h-5 w-5 mr-2" /> },
  { name: "Psicología", icon: <Brain className="h-5 w-5 mr-2" /> },
];

interface SpecialtySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const SpecialtySelector = ({ value, onChange }: SpecialtySelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Elige una categoría</h3>
      <div className="flex flex-wrap gap-3">
        {services.map((service) => (
          <Button
            key={service.name}
            variant={value === service.name ? "default" : "outline"}
            className={cn(
              "rounded-full px-4 py-2 h-auto transition-all",
              value === service.name && "shadow-md"
            )}
            onClick={() => onChange(service.name)}
          >
            {service.icon}
            {service.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SpecialtySelector;