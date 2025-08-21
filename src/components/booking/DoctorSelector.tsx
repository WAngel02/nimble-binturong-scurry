import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface DoctorSelectorProps {
  doctors: Profile[];
  value: string | undefined;
  onChange: (id: string) => void;
}

const DoctorSelector = ({ doctors, value, onChange }: DoctorSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Elige un doctor</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          <Card
            key="no-preference"
            className={cn(
              "w-48 flex-shrink-0 cursor-pointer transition-all hover:shadow-premium-md h-auto",
              value === "" ? "border-primary shadow-premium-md" : "border-border"
            )}
            onClick={() => onChange("")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
              <Avatar className="h-16 w-16 mb-3 bg-secondary flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </Avatar>
              <p className="font-semibold text-sm whitespace-normal">Sin Preferencia</p>
              <p className="text-xs text-muted-foreground whitespace-normal">Te asignaremos el mejor disponible</p>
            </CardContent>
          </Card>
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={cn(
                "w-48 flex-shrink-0 cursor-pointer transition-all hover:shadow-premium-md",
                value === doctor.id ? "border-primary shadow-premium-md" : "border-border"
              )}
              onClick={() => onChange(doctor.id)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarImage src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${doctor.full_name}`} alt={doctor.full_name} />
                  <AvatarFallback>{doctor.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm whitespace-normal">{doctor.full_name}</p>
                <p className="text-xs text-muted-foreground whitespace-normal">{doctor.specialties?.join(', ') || 'General'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default DoctorSelector;