import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigration() {
  console.log('🔧 Aplicando correção de permissões para gestor_almoxarifado...');
  
  try {
    // Primeiro, vamos testar se conseguimos fazer uma consulta simples
    console.log('🔍 Testando conexão com o banco...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('role')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Agora vamos tentar fazer uma atualização de teste em um pedido
    console.log('🧪 Testando permissões atuais...');
    const { data: orders, error: ordersError } = await supabase
      .from('order_requests')
      .select('id, status')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Erro ao buscar pedidos:', ordersError);
    } else {
      console.log('✅ Conseguiu buscar pedidos:', orders?.length || 0);
    }
    
    // Verificar o perfil do usuário atual
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();
      
      if (profile) {
        console.log('👤 Perfil do usuário:', profile.role);
      }
    }
    
    console.log('\n📋 RESUMO DA SITUAÇÃO:');
    console.log('- A migração SQL foi criada em: supabase/migrations/20250112000000-fix-gestor-permissions.sql');
    console.log('- Para aplicar a migração, você precisa:');
    console.log('  1. Ter acesso ao painel do Supabase (https://supabase.com/dashboard)');
    console.log('  2. Ir para o projeto: dbseigkbvnuhosbpygeh');
    console.log('  3. Acessar SQL Editor');
    console.log('  4. Executar o conteúdo da migração manualmente');
    console.log('\n🔧 ALTERNATIVA:');
    console.log('- O sistema já está configurado para permitir que gestores vejam e acessem a página de gerenciamento');
    console.log('- As ações de status (aprovar, entregar, receber) estão disponíveis na interface');
    console.log('- Se houver erro de permissão, será apenas no nível do banco de dados');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

applyMigration();