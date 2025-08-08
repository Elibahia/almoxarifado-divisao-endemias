
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';
import { useMovements } from '@/hooks/useMovements';
import { ProductCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface ReportFilters {
  category?: ProductCategory | 'all';
  status?: string;
  movementType?: string;
  expirationDays?: number;
  dateRange?: {
    from: Date;
    to: Date;
  };
  responsibleUser?: string;
}

export function useReports() {
  const { products } = useProducts();
  const { movements } = useMovements();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStockReport = (filters: ReportFilters) => {
    console.log('Generating stock report with filters:', filters);
    
    let filteredProducts = products;

    // Filtrar por categoria
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    // Filtrar por status
    if (filters.status && filters.status !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.status === filters.status);
    }

    return filteredProducts.map(product => ({
      nome: product.name,
      categoria: product.category,
      lote: product.batch,
      quantidadeAtual: product.currentQuantity,
      quantidadeMinima: product.minimumQuantity,
      validade: product.expirationDate.toLocaleDateString('pt-BR'),
      localizacao: product.location || '-',
      fornecedor: product.supplier || '-',
      status: product.status
    }));
  };

  const generateMovementReport = (filters: ReportFilters) => {
    console.log('Generating movement report with filters:', filters);
    
    let filteredMovements = movements;

    // Filtrar por tipo
    if (filters.movementType && filters.movementType !== 'all') {
      filteredMovements = filteredMovements.filter(m => m.type === filters.movementType);
    }

    // Filtrar por usuário responsável
    if (filters.responsibleUser && filters.responsibleUser !== 'all') {
      filteredMovements = filteredMovements.filter(m => m.responsibleUser === filters.responsibleUser);
    }

    // Filtrar por período
    if (filters.dateRange) {
      filteredMovements = filteredMovements.filter(m => {
        const movementDate = new Date(m.timestamp);
        return movementDate >= filters.dateRange!.from && movementDate <= filters.dateRange!.to;
      });
    }

    return filteredMovements.map(movement => ({
      produto: movement.productName,
      tipo: movement.type,
      quantidade: movement.quantity,
      motivo: movement.reason,
      responsavel: movement.responsibleUser,
      data: movement.timestamp.toLocaleDateString('pt-BR'),
      hora: movement.timestamp.toLocaleTimeString('pt-BR'),
      lote: movement.batch || '-',
      observacoes: movement.notes || '-'
    }));
  };

  const generateExpirationReport = (filters: ReportFilters) => {
    console.log('Generating expiration report with filters:', filters);
    
    let filteredProducts = products;
    const today = new Date();
    const daysToCheck = filters.expirationDays || 30;
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + daysToCheck);

    // Filtrar por categoria
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    // Filtrar produtos próximos ao vencimento ou vencidos
    if (filters.expirationDays === -1) {
      // Já vencidos
      filteredProducts = filteredProducts.filter(p => p.expirationDate < today);
    } else {
      // Próximos ao vencimento
      filteredProducts = filteredProducts.filter(p => 
        p.expirationDate >= today && p.expirationDate <= checkDate
      );
    }

    return filteredProducts.map(product => {
      const daysUntilExpiration = Math.ceil(
        (product.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        nome: product.name,
        categoria: product.category,
        lote: product.batch,
        quantidade: product.currentQuantity,
        validade: product.expirationDate.toLocaleDateString('pt-BR'),
        diasParaVencer: daysUntilExpiration,
        status: daysUntilExpiration < 0 ? 'Vencido' : `${daysUntilExpiration} dias`,
        localizacao: product.location || '-',
        fornecedor: product.supplier || '-'
      };
    });
  };

  type ReportRow = Record<string, string | number | null>
  const exportToPDF = async (data: ReportRow[], reportType: string, filters: ReportFilters) => {
    setIsGenerating(true);
    try {
      // Simulação de geração de PDF
      console.log('Generating PDF for:', reportType, data);
      
      // Em uma implementação real, você usaria uma biblioteca como jsPDF ou html2pdf
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular processamento
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Relatório de ${reportType} exportado para PDF.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório em PDF.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToExcel = async (data: ReportRow[], reportType: string, filters: ReportFilters) => {
    setIsGenerating(true);
    try {
      // Simulação de geração de Excel
      console.log('Generating Excel for:', reportType, data);
      
      // Em uma implementação real, você usaria uma biblioteca como xlsx
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular processamento
      
      toast({
        title: "Excel gerado com sucesso",
        description: `Relatório de ${reportType} exportado para Excel.`,
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar Excel",
        description: "Não foi possível gerar o relatório em Excel.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateStockReport,
    generateMovementReport,
    generateExpirationReport,
    exportToPDF,
    exportToExcel,
    isGenerating
  };
}
