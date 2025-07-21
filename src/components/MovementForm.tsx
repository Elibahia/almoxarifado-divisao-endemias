
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MovementType } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { getUnitLabel } from '@/types/unitTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const movementSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  type: z.enum(['entry', 'exit', 'adjustment', 'transfer']),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  responsibleUser: z.string().min(1, 'Responsável é obrigatório'),
  notes: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MovementForm({ isOpen, onClose, onSuccess }: MovementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useProducts();
  const { toast } = useToast();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: '',
      type: 'entry',
      quantity: 1,
      reason: '',
      responsibleUser: '',
      notes: '',
      invoiceNumber: '',
    },
  });

  const selectedType = form.watch('type');
  const selectedProductId = form.watch('productId');
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const onSubmit = async (data: MovementFormData) => {
    setIsLoading(true);
    console.log('Submitting movement:', data);

    try {
      // Buscar produto atual para verificar estoque
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('current_quantity, name')
        .eq('id', data.productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        throw new Error('Produto não encontrado');
      }

      // Calcular nova quantidade
      let newQuantity = product.current_quantity;
      if (data.type === 'entry' || data.type === 'transfer') {
        newQuantity += data.quantity;
      } else if (data.type === 'exit') {
        if (product.current_quantity < data.quantity) {
          throw new Error('Quantidade insuficiente em estoque');
        }
        newQuantity -= data.quantity;
      } else if (data.type === 'adjustment') {
        // Para ajustes, a quantidade pode ser positiva ou negativa
        newQuantity = data.quantity;
      }

      // Inserir movimentação
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: data.productId,
          type: data.type,
          quantity: data.type === 'exit' ? -data.quantity : data.quantity,
          reason: data.reason,
          responsible_user: data.responsibleUser,
          notes: data.notes || null,
          invoice_number: data.invoiceNumber || null,
        });

      if (movementError) {
        console.error('Error creating movement:', movementError);
        throw movementError;
      }

      // Atualizar quantidade do produto
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          current_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.productId);

      if (updateError) {
        console.error('Error updating product quantity:', updateError);
        throw updateError;
      }

      toast({
        title: "Movimentação registrada",
        description: `${product.name} - ${data.type === 'entry' ? 'Entrada' : data.type === 'exit' ? 'Saída' : data.type === 'adjustment' ? 'Ajuste' : 'Transferência'} de ${data.quantity} unidades`,
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error in onSubmit:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar movimentação",
        description: error.message || "Não foi possível registrar a movimentação.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="movement-form-description">
        <DialogHeader>
          <DialogTitle>Nova Movimentação</DialogTitle>
        </DialogHeader>
        <div id="movement-form-description" className="sr-only">
          Formulário para registrar uma nova movimentação de estoque
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Estoque: {product.currentQuantity} {getUnitLabel(product.unitOfMeasure)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entry">Entrada</SelectItem>
                      <SelectItem value="exit">Saída</SelectItem>
                      <SelectItem value="adjustment">Ajuste</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantidade {selectedType === 'adjustment' && '(Nova quantidade total)'}
                    {selectedProduct && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({getUnitLabel(selectedProduct.unitOfMeasure)})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra, Dispensação, Avaria..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsibleUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === 'entry' && (
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota Fiscal (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="medical" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Registrar Movimentação'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
