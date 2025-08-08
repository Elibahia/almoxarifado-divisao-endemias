
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useOrderRequests } from '@/hooks/useOrderRequests';
import { useSupervisor } from '@/contexts/SupervisorContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderFormData } from '@/types/orderTypes';
import { useOrderValidation } from '@/hooks/useOrderValidation';
import { useOrderProducts } from '@/hooks/useOrderProducts';
import { OrderBasicInfo } from '@/components/orders/OrderBasicInfo';
import { OrderProductList } from '@/components/orders/OrderProductList';
import { OrderObservations } from '@/components/orders/OrderObservations';

export function OrderRequestForm() {
  const { products } = useProducts();
  const { createOrderRequest } = useOrderRequests();
  const { selectedSubdistrict } = useSupervisor();
  const { userProfile } = useAuth();
  const { validateOrderForm } = useOrderValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    orderProducts,
    addProductRow,
    removeProductRow,
    updateProduct,
    resetProducts,
  } = useOrderProducts({
    products,
    onProductsChange: (products) => {
      // This will be handled by the form
    },
  });

  const form = useForm<OrderFormData>({
    defaultValues: {
      requesterName: '',
      subdistrict: selectedSubdistrict || '',
      products: orderProducts,
      observations: undefined,
    },
  });

  const getCurrentDate = () => {
    return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validation = validateOrderForm(data);
      if (!validation.success) {
        console.error('Validation errors:', validation.errors);
        return;
      }

      // Create order request
      await createOrderRequest.mutateAsync({
        requesterName: data.requesterName,
        subdistrict: data.subdistrict,
        products: data.products,
        observations: data.observations,
      });

      // Reset form
      form.reset();
      resetProducts();
      
      // Redirect to order management
      window.location.href = '/order-management';
    } catch (error) {
      console.error('Error creating order request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Solicitar Pedido
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Data: {getCurrentDate()}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderBasicInfo form={form} />
            </CardContent>
          </Card>

          {/* Products List */}
          <OrderProductList
            products={products}
            orderProducts={orderProducts}
            onAddProduct={addProductRow}
            onUpdateProduct={updateProduct}
            onRemoveProduct={removeProductRow}
          />

          {/* Observations */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderObservations form={form} />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createOrderRequest.isPending}
            >
              {isSubmitting || createOrderRequest.isPending ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
