#!/usr/bin/env node

/**
 * Script para debugar problemas no formulário de pedidos
 * Simula a validação e identifica possíveis problemas
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function analyzeOrderForm() {
  console.log(`${colors.bold}${colors.blue}=== ANÁLISE DO FORMULÁRIO DE PEDIDOS ===${colors.reset}\n`);
  
  // Verificar arquivos relacionados
  const filesToCheck = [
    'src/components/OrderRequestForm.tsx',
    'src/hooks/useOrderRequests.ts',
    'src/hooks/useOrderValidation.ts',
    'src/types/orderTypes.ts'
  ];
  
  const issues = [];
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(fullPath)) {
      issues.push({
        type: 'Arquivo não encontrado',
        file: file,
        severity: 'high'
      });
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Verificar problemas específicos
    if (file.includes('OrderRequestForm.tsx')) {
      // Verificar se a validação está sendo chamada corretamente
      if (!content.includes('validateOrderForm(data)')) {
        issues.push({
          type: 'Validação não encontrada',
          file: file,
          description: 'validateOrderForm não está sendo chamado',
          severity: 'high'
        });
      }
      
      // Verificar se há tratamento de erro adequado
      if (!content.includes('catch (error)')) {
        issues.push({
          type: 'Tratamento de erro ausente',
          file: file,
          description: 'Não há tratamento de erro no onSubmit',
          severity: 'medium'
        });
      }
      
      // Verificar se o estado de loading está sendo gerenciado
      if (!content.includes('setIsSubmitting')) {
        issues.push({
          type: 'Estado de loading não gerenciado',
          file: file,
          description: 'setIsSubmitting não encontrado',
          severity: 'medium'
        });
      }
    }
    
    if (file.includes('useOrderValidation.ts')) {
      // Verificar estrutura da validação de produtos
      if (content.includes('errors.products[index] = { productId:')) {
        issues.push({
          type: 'Estrutura de erro incorreta',
          file: file,
          description: 'Estrutura de erro para produtos pode estar incorreta',
          severity: 'high',
          line: getLineNumber(content, 'errors.products[index] = { productId:')
        });
      }
    }
    
    if (file.includes('useOrderRequests.ts')) {
      // Verificar se há conversão de tipos adequada
      if (!content.includes('Number(product.quantity)')) {
        issues.push({
          type: 'Conversão de tipo ausente',
          file: file,
          description: 'Quantidade não está sendo convertida para número',
          severity: 'medium'
        });
      }
    }
    
    if (file.includes('orderTypes.ts')) {
      // Verificar se quantity permite string e number
      if (!content.includes('quantity: number | string')) {
        issues.push({
          type: 'Tipo de quantidade restritivo',
          file: file,
          description: 'Quantity deveria permitir string durante edição',
          severity: 'low'
        });
      }
    }
  });
  
  // Verificar problemas comuns de formulário React
  const orderFormPath = path.join(process.cwd(), 'src/components/OrderRequestForm.tsx');
  if (fs.existsSync(orderFormPath)) {
    const content = fs.readFileSync(orderFormPath, 'utf8');
    
    // Verificar se há preventDefault
    if (!content.includes('form.handleSubmit(onSubmit)')) {
      issues.push({
        type: 'Submissão de formulário incorreta',
        file: 'OrderRequestForm.tsx',
        description: 'Deve usar form.handleSubmit(onSubmit)',
        severity: 'high'
      });
    }
    
    // Verificar se há validação antes do envio
    if (content.includes('return;') && content.includes('validation.errors')) {
      // Verificar se o return está parando a execução corretamente
      const lines = content.split('\n');
      let foundValidationReturn = false;
      
      lines.forEach((line, index) => {
        if (line.includes('validation.errors') && lines[index + 1] && lines[index + 1].trim() === 'return;') {
          foundValidationReturn = true;
        }
      });
      
      if (!foundValidationReturn) {
        issues.push({
          type: 'Validação não para execução',
          file: 'OrderRequestForm.tsx',
          description: 'Return após validation.errors pode não estar funcionando',
          severity: 'high'
        });
      }
    }
  }
  
  return issues;
}

function getLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return null;
}

function generateReport(issues) {
  if (issues.length === 0) {
    console.log(`${colors.green}✅ Nenhum problema encontrado no formulário de pedidos!${colors.reset}\n`);
    return;
  }
  
  const highSeverity = issues.filter(i => i.severity === 'high');
  const mediumSeverity = issues.filter(i => i.severity === 'medium');
  const lowSeverity = issues.filter(i => i.severity === 'low');
  
  console.log(`${colors.red}🚨 Problemas críticos: ${highSeverity.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Problemas médios: ${mediumSeverity.length}${colors.reset}`);
  console.log(`${colors.blue}ℹ️  Problemas menores: ${lowSeverity.length}${colors.reset}\n`);
  
  [...highSeverity, ...mediumSeverity, ...lowSeverity].forEach(issue => {
    const severityColor = issue.severity === 'high' ? colors.red : 
                         issue.severity === 'medium' ? colors.yellow : colors.blue;
    const severityIcon = issue.severity === 'high' ? '🚨' : 
                        issue.severity === 'medium' ? '⚠️' : 'ℹ️';
    
    console.log(`${severityIcon} ${severityColor}${issue.type}${colors.reset}`);
    console.log(`   📁 ${issue.file}`);
    if (issue.line) console.log(`   📍 Linha ${issue.line}`);
    if (issue.description) console.log(`   📝 ${issue.description}`);
    console.log('');
  });
  
  // Sugestões de correção
  console.log(`${colors.bold}=== SUGESTÕES DE CORREÇÃO ===${colors.reset}\n`);
  
  if (highSeverity.length > 0) {
    console.log(`${colors.red}${colors.bold}CRÍTICO:${colors.reset}`);
    console.log(`1. Verificar se a validação está retornando corretamente`);
    console.log(`2. Adicionar logs de debug no onSubmit`);
    console.log(`3. Verificar estrutura de dados dos produtos`);
    console.log(`4. Testar formulário com dados válidos\n`);
  }
  
  console.log(`${colors.green}${colors.bold}COMO DEBUGAR:${colors.reset}`);
  console.log(`1. Abrir DevTools do navegador`);
  console.log(`2. Ir para a aba Console`);
  console.log(`3. Tentar enviar um pedido`);
  console.log(`4. Verificar mensagens de erro`);
  console.log(`5. Verificar Network tab para requisições falhadas\n`);
  
  console.log(`${colors.blue}${colors.bold}DADOS DE TESTE:${colors.reset}`);
  console.log(`- Nome: "João Silva"`);
  console.log(`- Subdistrito: "711"`);
  console.log(`- Produto: Qualquer produto da lista`);
  console.log(`- Quantidade: 1`);
}

function main() {
  console.log(`${colors.bold}🔍 Analisando formulário de pedidos...${colors.reset}\n`);
  
  const issues = analyzeOrderForm();
  generateReport(issues);
  
  // Exit code baseado na severidade
  const hasHighSeverity = issues.some(i => i.severity === 'high');
  process.exit(hasHighSeverity ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeOrderForm, generateReport };