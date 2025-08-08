import { User, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormData } from '@/types/orderTypes';
import { SUBDISTRICTS } from '@/types/orderTypes';

interface OrderBasicInfoProps {
  form: UseFormReturn<OrderFormData>;
}

export function OrderBasicInfo({ form }: OrderBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="requesterName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome do Solicitante
            </FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do solicitante" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subdistrict"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Subdistrito
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subdistrito" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SUBDISTRICTS.map((subdistrict) => (
                  <SelectItem key={subdistrict.value} value={subdistrict.value}>
                    {subdistrict.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
