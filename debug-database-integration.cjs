const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISE DE INTEGRAÇÃO COM BANCO DE DADOS');
console.log('=' .repeat(50));

// Verificar arquivos de configuração
const supabaseClientPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'client.ts');
const orderRequestsHookPath = path.join(__dirname, 'src', 'hooks', 'useOrderRequests.ts');
const orderFormPath = path.join(__dirname, 'src', 'components', 'OrderRequestForm.tsx');

function analyzeFile(filePath, fileName) {
  console.log(`\n📁 Analisando ${fileName}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`✅ Arquivo encontrado (${content.length} caracteres)`);
  
  return { content, path: filePath };
}

// Analisar arquivos principais
const supabaseClient = analyzeFile(supabaseClientPath, 'Supabase Client');
const orderRequestsHook = analyzeFile(orderRequestsHookPath, 'useOrderRequests Hook');
const orderForm = analyzeFile(orderFormPath, 'OrderRequestForm Component');

if (!supabaseClient || !orderRequestsHook || !orderForm) {
  console.log('\n❌ ERRO: Arquivos essenciais não encontrados!');
  process.exit(1);
}

console.log('\n🔍 VERIFICAÇÕES ESPECÍFICAS:');
console.log('-'.repeat(30));

// 1. Verificar configuração do Supabase
console.log('\n1. Configuração do Supabase:');
if (supabaseClient.content.includes('SUPABASE_URL') && supabaseClient.content.includes('SUPABASE_PUBLISHABLE_KEY')) {
  console.log('✅ URLs e chaves configuradas');
} else {
  console.log('❌ Configuração do Supabase incompleta');
}

// 2. Verificar função createOrderRequest
console.log('\n2. Função createOrderRequest:');
if (orderRequestsHook.content.includes('createOrderRequest')) {
  console.log('✅ Função createOrderRequest encontrada');
  
  // Verificar se há tratamento de erro
  if (orderRequestsHook.content.includes('onError')) {
    console.log('✅ Tratamento de erro implementado');
  } else {
    console.log('⚠️  Tratamento de erro pode estar incompleto');
  }
  
  // Verificar se há validação de usuário
  if (orderRequestsHook.content.includes('supabase.auth.getUser')) {
    console.log('✅ Verificação de autenticação implementada');
  } else {
    console.log('❌ Verificação de autenticação ausente');
  }
  
} else {
  console.log('❌ Função createOrderRequest não encontrada');
}

// 3. Verificar uso no formulário
console.log('\n3. Integração no formulário:');
if (orderForm.content.includes('createOrderRequest.mutateAsync')) {
  console.log('✅ Chamada da função no formulário encontrada');
} else {
  console.log('❌ Chamada da função no formulário não encontrada');
}

// 4. Verificar tratamento de erro no formulário
if (orderForm.content.includes('catch (error)')) {
  console.log('✅ Tratamento de erro no formulário implementado');
} else {
  console.log('❌ Tratamento de erro no formulário ausente');
}

// 5. Verificar estrutura de dados
console.log('\n4. Estrutura de dados:');
const requiredFields = ['requesterName', 'subdistrict', 'products', 'observations'];
let missingFields = [];

requiredFields.forEach(field => {
  if (!orderForm.content.includes(field)) {
    missingFields.push(field);
  }
});

if (missingFields.length === 0) {
  console.log('✅ Todos os campos obrigatórios estão presentes');
} else {
  console.log(`❌ Campos ausentes: ${missingFields.join(', ')}`);
}

// 6. Verificar tabelas do banco
console.log('\n5. Tabelas do banco de dados:');
if (orderRequestsHook.content.includes('order_requests') && orderRequestsHook.content.includes('order_request_items')) {
  console.log('✅ Referências às tabelas corretas encontradas');
} else {
  console.log('❌ Referências às tabelas do banco ausentes ou incorretas');
}

// 7. Análise de possíveis problemas
console.log('\n🚨 POSSÍVEIS PROBLEMAS IDENTIFICADOS:');
console.log('-'.repeat(40));

let problemsFound = [];

// Verificar se há await sem try-catch adequado
if (orderForm.content.includes('await createOrderRequest.mutateAsync') && !orderForm.content.includes('try {')) {
  problemsFound.push('Chamada async sem try-catch adequado');
}

// Verificar se há validação antes do envio
if (!orderForm.content.includes('validateOrderForm')) {
  problemsFound.push('Validação de formulário ausente antes do envio');
}

// Verificar se há feedback visual
if (!orderForm.content.includes('setIsSubmitting')) {
  problemsFound.push('Estado de loading ausente');
}

if (problemsFound.length === 0) {
  console.log('✅ Nenhum problema óbvio identificado na estrutura');
} else {
  problemsFound.forEach((problem, index) => {
    console.log(`${index + 1}. ❌ ${problem}`);
  });
}

// 8. Sugestões de debug
console.log('\n💡 SUGESTÕES PARA DEBUG:');
console.log('-'.repeat(25));
console.log('1. Verificar se o usuário está autenticado no Supabase');
console.log('2. Verificar logs do console do navegador durante o envio');
console.log('3. Verificar se as tabelas existem no banco de dados');
console.log('4. Verificar se as políticas RLS estão configuradas corretamente');
console.log('5. Testar a conexão com o Supabase diretamente');

console.log('\n🎯 PRÓXIMOS PASSOS RECOMENDADOS:');
console.log('-'.repeat(30));
console.log('1. Adicionar logs detalhados na função createOrderRequest');
console.log('2. Verificar autenticação do usuário antes do envio');
console.log('3. Implementar feedback visual mais claro para erros');
console.log('4. Testar com dados de exemplo válidos');

console.log('\n✅ ANÁLISE CONCLUÍDA!');
console.log('=' .repeat(50));