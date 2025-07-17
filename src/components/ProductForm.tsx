
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory } from '@/types';
import { UNIT_OF_MEASURE_OPTIONS } from '@/types/unitTypes';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.nativeEnum(ProductCategory),
  description: z.string().optional(),
  batch: z.string().min(1, "Lote é obrigatório"),
  expirationDate: z.string().min(1, "Data de validade é obrigatória"),
  minimumQuantity: z.number().min(0, "Quantidade mínima deve ser positiva"),
  currentQuantity: z.number().min(0, "Quantidade atual deve ser positiva"),
  location: z.string().optional(),
  supplier: z.string().optional(),
  unitOfMeasure: z.string().min(1, "Unidade de medida é obrigatória"),
});

interface ProductFormProps {
  product?: (Product & { unitOfMeasure?: string }) | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || ProductCategory.GRAPHIC_MATERIALS,
      description: product?.description || "",
      batch: product?.batch || "",
      expirationDate: product?.expirationDate ? product.expirationDate.toISOString().split('T')[0] : "",
      minimumQuantity: product?.minimumQuantity || 0,
      currentQuantity: product?.currentQuantity || 0,
      location: product?.location || "",
      supplier: product?.supplier || "",
      unitOfMeasure: product?.unitOfMeasure || 'unid.',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log('Submitting product:', values);

    try {
      let data, error;
      
      if (product) {
        // Update existing product
        const result = await supabase
          .from('products')
          .update({
            name: values.name,
            category: values.category,
            description: values.description || null,
            batch: values.batch,
            expiration_date: values.expirationDate,
            minimum_quantity: values.minimumQuantity,
            current_quantity: values.currentQuantity,
            location: values.location || null,
            supplier: values.supplier || null,
            unit_of_measure: values.unitOfMeasure,
          })
          .eq('id', product.id)
          .select();
        
        data = result.data;
        error = result.error;
      } else {
        // Create new product
        const result = await supabase
          .from('products')
          .insert([
            {
              name: values.name,
              category: values.category,
              description: values.description || null,
              batch: values.batch,
              expiration_date: values.expirationDate,
              minimum_quantity: values.minimumQuantity,
              current_quantity: values.currentQuantity,
              location: values.location || null,
              supplier: values.supplier || null,
              unit_of_measure: values.unitOfMeasure,
            }
          ])
          .select();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      console.log(`Product ${product ? 'updated' : 'created'} successfully:`, data);
      toast({
        title: `Produto ${product ? 'atualizado' : 'criado'} com sucesso!`,
        description: `${values.name} foi ${product ? 'atualizado' : 'adicionado ao estoque'}.`,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: `Erro ao ${product ? 'atualizar' : 'criar'} produto`,
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: ProductCategory) => {
    const labels = {
      [ProductCategory.GRAPHIC_MATERIALS]: 'Materiais Gráficos',
      [ProductCategory.CLEANING_MATERIALS]: 'Materiais de Limpeza',
      [ProductCategory.UNIFORMS]: 'Fardamentos',
      [ProductCategory.OFFICE_SUPPLIES]: 'Material de Escritório',
      [ProductCategory.ENDEMIC_CONTROL]: 'Controle Endemia',
      [ProductCategory.LABORATORY]: 'Laboratório',
      [ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT]: 'EPIs',
      [ProductCategory.OTHER]: 'Outros'
    };
    return labels[category] || category;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProductCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryLabel(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do produto (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote *</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do lote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Validade *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Mínima *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Atual *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prateleira A1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="medical"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Salvando...' : (product ? 'Atualizar Produto' : 'Salvar Produto')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
