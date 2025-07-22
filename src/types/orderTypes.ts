
export interface OrderProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number | string; // Permite string vazia durante edição
  unitOfMeasure: string;
}

export interface OrderRequest {
  requesterName: string;
  subdistrict: string;
  requestDate: Date;
  products: OrderProduct[];
  observations?: string;
}

export interface OrderFormData {
  requesterName: string;
  subdistrict: string;
  products: OrderProduct[];
  observations?: string;
}

export const SUBDISTRICTS = [
  { value: '711', label: '711' },
  { value: '721', label: '721' },
  { value: '731', label: '731' },
  { value: '741', label: '741' },
  { value: '751', label: '751' },
  { value: '761', label: '761' },
  { value: '771', label: '771' },
  { value: 'UBV', label: 'UBV' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Leptospirose', label: 'Leptospirose' },
] as const;
