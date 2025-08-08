#!/usr/bin/env node

/**
 * Script para verificar problemas específicos de renderização de objetos em componentes React
 * Foca em problemas reais como SelectItem com objetos
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const results = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      const fileResults = {
        file: relativePath,
        issues: []
      };
      
      // Verificar SelectItem com possíveis objetos
      const selectItemPattern = /<SelectItem[^>]*key=\{([^}]+)\}[^>]*value=\{([^}]+)\}[^>]*>\s*\{([^}]+)\}/g;
      let match;
      
      while ((match = selectItemPattern.exec(content)) !== null) {
        const [fullMatch, keyPart, valuePart, childrenPart] = match;
        
        // Verificar se key, value ou children podem ser objetos
        const keyVar = keyPart.trim();
        const valueVar = valuePart.trim();
        const childrenVar = childrenPart.trim();
        
        // Detectar padrões problemáticos
        const isProblematic = (
          // Se key e value são a mesma variável (provável objeto)
          keyVar === valueVar ||
          // Se children é a mesma variável que key/value (provável objeto)
          childrenVar === keyVar || childrenVar === valueVar ||
          // Se não tem .propriedade (provável objeto direto)
          (!keyVar.includes('.') && !keyVar.includes('[') && keyVar.length > 1) ||
          (!valueVar.includes('.') && !valueVar.includes('[') && valueVar.length > 1) ||
          (!childrenVar.includes('.') && !childrenVar.includes('[') && childrenVar.length > 1)
        );
        
        if (isProblematic) {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          
          fileResults.issues.push({
            type: 'SelectItem com possível objeto',
            line: lineNumber,
            match: fullMatch.trim(),
            key: keyVar,
            value: valueVar,
            children: childrenVar,
            context: getContextLines(content, lineNumber, 3)
          });
        }
      }
      
      // Verificar imports de SUBDISTRICTS para ver se está sendo usado corretamente
      if (content.includes('SUBDISTRICTS')) {
        const subdistrictUsage = /SUBDISTRICTS\.map\(\s*\(([^)]+)\)\s*=>\s*\([^)]*<SelectItem[^>]*>\s*\{([^}]+)\}/g;
        let subdistrictMatch;
        
        while ((subdistrictMatch = subdistrictUsage.exec(content)) !== null) {
          const [fullMatch, paramName, childrenPart] = subdistrictMatch;
          const param = paramName.trim();
          const children = childrenPart.trim();
          
          // Se children é igual ao parâmetro (renderizando objeto direto)
          if (children === param) {
            const lines = content.substring(0, subdistrictMatch.index).split('\n');
            const lineNumber = lines.length;
            
            fileResults.issues.push({
              type: 'SUBDISTRICTS renderizando objeto direto',
              line: lineNumber,
              match: fullMatch.trim(),
              suggestion: `Use ${param}.label em vez de ${param}`,
              context: getContextLines(content, lineNumber, 3)
            });
          }
        }
      }
      
      if (fileResults.issues.length > 0) {
        results.push(fileResults);
      }
    } catch (error) {
      console.error(`${colors.red}Erro ao ler arquivo ${filePath}: ${error.message}${colors.reset}`);
    }
  }
  
  function walkDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walkDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          scanFile(fullPath);
        }
      }
    });
  }
  
  walkDirectory(dir);
  return results;
}

function getContextLines(content, lineNumber, contextSize) {
  const lines = content.split('\n');
  const start = Math.max(0, lineNumber - contextSize - 1);
  const end = Math.min(lines.length, lineNumber + contextSize);
  
  return lines.slice(start, end).map((line, index) => {
    const actualLineNumber = start + index + 1;
    const isTargetLine = actualLineNumber === lineNumber;
    const prefix = isTargetLine ? '>>> ' : '    ';
    return `${prefix}${actualLineNumber.toString().padStart(3)}: ${line}`;
  }).join('\n');
}

function generateReport(results) {
  console.log(`${colors.bold}${colors.blue}=== VERIFICAÇÃO DE RENDERIZAÇÃO DE OBJETOS REACT ===${colors.reset}\n`);
  
  if (results.length === 0) {
    console.log(`${colors.green}✅ Nenhum problema encontrado!${colors.reset}\n`);
    return;
  }
  
  let totalIssues = 0;
  
  results.forEach(fileResult => {
    console.log(`${colors.bold}📁 ${fileResult.file}${colors.reset}`);
    
    fileResult.issues.forEach(issue => {
      totalIssues++;
      
      console.log(`  🚨 ${colors.red}${issue.type}${colors.reset}`);
      console.log(`     Linha ${issue.line}`);
      
      if (issue.key && issue.value && issue.children) {
        console.log(`     Key: ${colors.yellow}${issue.key}${colors.reset}`);
        console.log(`     Value: ${colors.yellow}${issue.value}${colors.reset}`);
        console.log(`     Children: ${colors.yellow}${issue.children}${colors.reset}`);
      }
      
      if (issue.suggestion) {
        console.log(`     ${colors.green}Sugestão: ${issue.suggestion}${colors.reset}`);
      }
      
      console.log(`\n${issue.context}\n`);
    });
    
    console.log('');
  });
  
  // Resumo
  console.log(`${colors.bold}=== RESUMO ===${colors.reset}`);
  console.log(`🚨 Total de problemas: ${totalIssues}`);
  console.log(`📁 Arquivos afetados: ${results.length}`);
  
  if (totalIssues > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠️  AÇÃO NECESSÁRIA: Corrija os problemas antes do deploy!${colors.reset}`);
    console.log(`\n${colors.bold}Como corrigir:${colors.reset}`);
    console.log(`1. Para SUBDISTRICTS: use ${colors.green}subdistrict.label${colors.reset} em vez de ${colors.red}subdistrict${colors.reset}`);
    console.log(`2. Para SelectItem: use ${colors.green}item.value${colors.reset} e ${colors.green}item.label${colors.reset}`);
    console.log(`3. Sempre renderize propriedades de objetos, nunca o objeto inteiro`);
  }
}

function main() {
  console.log(`${colors.bold}🔍 Verificando problemas específicos de renderização de objetos...${colors.reset}\n`);
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`${colors.red}❌ Diretório 'src' não encontrado!${colors.reset}`);
    process.exit(1);
  }
  
  const results = scanDirectory(srcDir);
  generateReport(results);
  
  // Exit code baseado na presença de problemas
  const hasIssues = results.length > 0;
  process.exit(hasIssues ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateReport };