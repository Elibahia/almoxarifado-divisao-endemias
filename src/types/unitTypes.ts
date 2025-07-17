
export const UNIT_OF_MEASURE_OPTIONS = [
  { value: 'unid.', label: 'Unidade (unid.)' },
  { value: 'pc', label: 'Peça (pc)' },
  { value: 'bloco', label: 'Bloco' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'pct', label: 'Pacote (pct)' },
  { value: 'kit', label: 'Kit' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 't', label: 'Tonelada (t)' },
  { value: 'mg', label: 'Miligrama (mg)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'm³', label: 'Metro cúbico (m³)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'mm', label: 'Milímetro (mm)' },
  { value: 'in', label: 'Polegada (in)' },
  { value: 'dz', label: 'Dúzia (dz)' },
  { value: 'par', label: 'Par' },
  { value: 'gal', label: 'Galão (gal)' },
  { value: 'saco', label: 'Saco' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'lata', label: 'Lata' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'ampola', label: 'Ampola' },
  { value: 'bobina', label: 'Bobina' },
  { value: 'fardo', label: 'Fardo' },
  { value: 'cartela', label: 'Cartela' },
  { value: 'barra', label: 'Barra' },
  { value: 'balde', label: 'Balde' }
] as const;

export type UnitOfMeasure = typeof UNIT_OF_MEASURE_OPTIONS[number]['value'];

export const getUnitLabel = (unit: string): string => {
  const unitOption = UNIT_OF_MEASURE_OPTIONS.find(option => option.value === unit);
  return unitOption ? unitOption.label : unit;
};
