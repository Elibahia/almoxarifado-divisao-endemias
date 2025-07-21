
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Package, Calendar, User, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/hooks/useProducts';
import { useOrderRequests } from '@/hooks/useOrderRequests';
import { useSupervisor } from '@/contexts/SupervisorContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderFormData, OrderProduct, SUBDISTRICTS } from '@/types/orderTypes';
import { UNIT_OF_MEASURE_OPTIONS } from '@/types/unitTypes';

const orderSchema = z.object({
  requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
  subdistrict: z.string().min(1, 'Subdistrito é obrigatório'),
  products: z.array(z.object({
    id: z.string(),
    productId: z.string().min(1, 'Produto é obrigatório'),
    productName: z.string().min(1, 'Nome do produto é obrigatório'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
    unitOfMeasure: z.string().min(1, 'Unidade de medida é obrigatória'),
  })).min(1, 'Pelo menos um produto deve ser adicionado'),
  observations: z.string().optional(),
});

export function OrderRequestForm() {
  const { products } = useProducts();
  const { createOrderRequest } = useOrderRequests();
  const { selectedSubdistrict, setSelectedSubdistrict } = useSupervisor();
  const { userProfile } = useAuth();
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([
    { id: '1', productId: '', productName: '', quantity: 1, unitOfMeasure: 'unid.' }
  ]);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      requesterName: '',
      subdistrict: selectedSubdistrict || '',
      products: orderProducts,
      observations: undefined,
    },
  });

  const addProductRow = useCallback(() => {
    const newProduct: OrderProduct = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitOfMeasure: 'unid.',
    };
    const updatedProducts = [...orderProducts, newProduct];
    setOrderProducts(updatedProducts);
    form.setValue('products', updatedProducts);
  }, [orderProducts, form]);

  const removeProductRow = useCallback((id: string) => {
    if (orderProducts.length === 1) {
      return;
    }
    const updatedProducts = orderProducts.filter(p => p.id !== id);
    setOrderProducts(updatedProducts);
    form.setValue('products', updatedProducts);
  }, [orderProducts, form]);

  const updateProduct = useCallback((id: string, field: keyof OrderProduct, value: string | number) => {
    const updatedProducts = orderProducts.map(p => {
      if (p.id === id) {
        const updatedProduct = { ...p, [field]: value };
        if (field === 'productId' && typeof value === 'string') {
          const selectedProduct = products.find(prod => prod.id === value);
          if (selectedProduct) {
            updatedProduct.productName = selectedProduct.name;
            updatedProduct.unitOfMeasure = selectedProduct.unitOfMeasure || 'unid.';
          }
        }
        return updatedProduct;
      }
      return p;
    });
    setOrderProducts(updatedProducts);
    form.setValue('products', updatedProducts);
  }, [orderProducts, products, form]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      await createOrderRequest.mutateAsync({
        requesterName: data.requesterName,
        subdistrict: data.subdistrict,
        products: orderProducts,
        observations: data.observations,
      });

      // Reset form but keep subdistrict for supervisors
      const resetValues = {
        requesterName: '',
        subdistrict: userProfile?.role === 'supervisor_geral' ? data.subdistrict : '',
        products: [{ id: '1', productId: '', productName: '', quantity: 1, unitOfMeasure: 'unid.' }],
        observations: undefined,
      };
      
      form.reset(resetValues);
      setOrderProducts([{ id: '1', productId: '', productName: '', quantity: 1, unitOfMeasure: 'unid.' }]);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const today = format(new Date(), 'dd/MM/yyyy');

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-6xl">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Solicitação de Pedido</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Preencha o formulário abaixo para solicitar produtos do almoxarifado
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Solicitante *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
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
                    <FormLabel>Subdistrito *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Se for supervisor, salva o subdistrito selecionado no contexto
                        if (userProfile?.role === 'supervisor_geral') {
                          setSelectedSubdistrict(value);
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o subdistrito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBDISTRICTS.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data do Pedido
                </FormLabel>
                <Input value={today} readOnly className="bg-muted" />
              </FormItem>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Solicitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto *</TableHead>
                      <TableHead className="w-32">Quantidade *</TableHead>
                      <TableHead className="w-40">Unidade</TableHead>
                      <TableHead className="w-16">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Select
                            onValueChange={(value) => updateProduct(product.id, 'productId', value)}
                            value={product.productId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id}>
                                  {prod.name} (Lote: {prod.batch})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => updateProduct(product.id, 'unitOfMeasure', value)}
                            value={product.unitOfMeasure}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeProductRow(product.id)}
                            disabled={orderProducts.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {orderProducts.map((product, index) => (
                  <Card key={product.id} className="p-4 border-2 border-dashed border-muted">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-foreground">Produto #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProductRow(product.id)}
                        disabled={orderProducts.length === 1}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Produto *
                        </label>
                        <Select
                          onValueChange={(value) => updateProduct(product.id, 'productId', value)}
                          value={product.productId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.name} (Lote: {prod.batch})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Quantidade *
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Unidade
                          </label>
                          <Select
                            onValueChange={(value) => updateProduct(product.id, 'unitOfMeasure', value)}
                            value={product.unitOfMeasure}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addProductRow}
                className="mt-4 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>

              {form.formState.errors.products && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.products.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações gerais sobre o pedido (opcional)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <div className="flex justify-center sm:justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={createOrderRequest.isPending}
              className="w-full sm:w-auto px-8"
            >
              {createOrderRequest.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Enviando...</span>
                  <span className="sm:hidden">Enviando...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Enviar Pedido</span>
                  <span className="sm:hidden">Enviar</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
