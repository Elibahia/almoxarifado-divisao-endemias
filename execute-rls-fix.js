import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

// IMPORTANTE: Para executar comandos DDL (CREATE, DROP, ALTER), você precisa da SERVICE_ROLE_KEY
// A ANON_KEY tem limitações de segurança e não pode executar comandos administrativos
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);

async function executeRLSFix() {
  console.log('🔧 Executando correção das políticas RLS...');
  
  try {
    // Ler o arquivo SQL
    const sqlFilePath = join(__dirname, 'fix-rls-policies.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    if (!SUPABASE_SERVICE_KEY) {
      console.log('⚠️  AVISO: SERVICE_ROLE_KEY não encontrada!');
      console.log('   Para executar comandos DDL, você precisa:');
      console.log('   1. Obter a SERVICE_ROLE_KEY do painel do Supabase');
      console.log('   2. Definir a variável de ambiente: SUPABASE_SERVICE_KEY=sua_chave');
      console.log('   3. Executar novamente este script');
      console.log('');
      console.log('🔗 Como obter a SERVICE_ROLE_KEY:');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/dbseigkbvnuhosbpygeh/settings/api');
      console.log('   2. Copie a "service_role" key (não a "anon" key)');
      console.log('   3. Execute: $env:SUPABASE_SERVICE_KEY="sua_chave_aqui"');
      console.log('   4. Execute novamente: node execute-rls-fix.js');
      console.log('');
      console.log('📋 ALTERNATIVA MANUAL:');
      console.log('   1. Acesse o SQL Editor no painel do Supabase');
      console.log('   2. Cole e execute o conteúdo do arquivo fix-rls-policies.sql');
      return;
    }
    
    console.log('🔑 SERVICE_ROLE_KEY encontrada, executando SQL...');
    
    // Dividir o SQL em comandos individuais (separados por ;)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`);
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.toLowerCase().includes('select')) {
        // Para comandos SELECT, usar .from() ou .rpc()
        console.log(`🔍 Executando consulta ${i + 1}...`);
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.log(`⚠️  Erro na consulta ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Consulta ${i + 1} executada com sucesso`);
            if (data) console.log('   Resultado:', data);
          }
        } catch (err) {
          console.log(`⚠️  Erro na consulta ${i + 1}:`, err.message);
        }
      } else {
        // Para comandos DDL (CREATE, DROP, ALTER)
        console.log(`🔧 Executando comando ${i + 1}...`);
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.log(`❌ Erro no comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.log(`❌ Erro no comando ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('📋 Próximos passos:');
    console.log('   1. Teste a funcionalidade na aplicação');
    console.log('   2. Verifique se gestores conseguem aprovar/entregar pedidos');
    console.log('   3. Se ainda houver problemas, execute o SQL manualmente no painel');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    console.log('\n🔧 SOLUÇÃO ALTERNATIVA:');
    console.log('   Execute o SQL manualmente no painel do Supabase:');
    console.log('   https://supabase.com/dashboard/project/dbseigkbvnuhosbpygeh/sql');
  }
}

executeRLSFix();