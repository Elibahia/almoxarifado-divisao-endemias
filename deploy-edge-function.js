import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deployEdgeFunction() {
  console.log('🚀 Preparando deploy da Edge Function...');
  
  try {
    // Ler o arquivo da Edge Function
    const functionPath = join(__dirname, 'supabase', 'functions', 'update-order-status', 'index.ts');
    const functionCode = readFileSync(functionPath, 'utf8');
    
    console.log('📁 Arquivo da função carregado com sucesso');
    console.log('📏 Tamanho do código:', functionCode.length, 'caracteres');
    
    console.log('\n📋 INSTRUÇÕES PARA DEPLOY MANUAL:');
    console.log('\n1. 🌐 Acesse o painel do Supabase:');
    console.log('   https://supabase.com/dashboard/project/dbseigkbvnuhosbpygeh');
    
    console.log('\n2. 📝 Vá para Edge Functions:');
    console.log('   - No menu lateral, clique em "Edge Functions"');
    console.log('   - Clique em "Create a new function"');
    console.log('   - Nome da função: update-order-status');
    
    console.log('\n3. 💾 Cole o código da função:');
    console.log('   - O código está no arquivo: supabase/functions/update-order-status/index.ts');
    console.log('   - Copie todo o conteúdo e cole no editor do Supabase');
    
    console.log('\n4. 🚀 Deploy:');
    console.log('   - Clique em "Deploy function"');
    console.log('   - Aguarde o deploy ser concluído');
    
    console.log('\n5. ✅ Teste:');
    console.log('   - Após o deploy, teste a funcionalidade no sistema');
    console.log('   - Gestores de almoxarifado devem conseguir aprovar/entregar pedidos');
    
    console.log('\n🔧 ALTERNATIVA - Deploy via CLI (se tiver o Supabase CLI instalado):');
    console.log('   1. supabase login');
    console.log('   2. supabase functions deploy update-order-status --project-ref dbseigkbvnuhosbpygeh');
    
    console.log('\n📊 STATUS ATUAL:');
    console.log('   ✅ Edge Function criada localmente');
    console.log('   ✅ Hook modificado para usar fallback');
    console.log('   ⏳ Aguardando deploy da função no Supabase');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

deployEdgeFunction();