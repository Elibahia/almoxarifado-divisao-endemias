import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormData } from '@/types/orderTypes';

interface OrderObservationsProps {
  form: UseFormReturn<OrderFormData>;
}

export function OrderObservations({ form }: OrderObservationsProps) {
  return (
    <FormField
      control={form.control}
      name="observations"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Observações (Opcional)
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Digite observações adicionais sobre o pedido..."
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
