import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGestorPermissions() {
  console.log('🧪 Testando permissões do gestor de almoxarifado após correção SQL...');
  
  try {
    // 1. Verificar se o usuário está autenticado
    console.log('\n1. Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Usuário não autenticado. Faça login na aplicação primeiro.');
      console.log('   Acesse: http://localhost:5173 e faça login como gestor_almoxarifado');
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // 2. Verificar o perfil do usuário
    console.log('\n2. Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, role, is_active')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }
    
    console.log('👤 Perfil encontrado:');
    console.log('   - Email:', profile.email);
    console.log('   - Role:', profile.role);
    console.log('   - Ativo:', profile.is_active);
    
    if (!['admin', 'gestor_almoxarifado'].includes(profile.role)) {
      console.log('⚠️  Este usuário não é gestor ou admin. Teste com um usuário gestor_almoxarifado.');
      return;
    }
    
    // 3. Testar a função is_gestor
    console.log('\n3. Testando função is_gestor...');
    const { data: gestorTest, error: gestorError } = await supabase
      .rpc('is_gestor', { user_id: user.id });
    
    if (gestorError) {
      console.log('❌ Erro ao testar função is_gestor:', gestorError.message);
    } else {
      console.log('✅ Função is_gestor retornou:', gestorTest);
    }
    
    // 4. Buscar um pedido para teste
    console.log('\n4. Buscando pedidos para teste...');
    const { data: orders, error: ordersError } = await supabase
      .from('order_requests')
      .select('id, status, created_by, created_at')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError.message);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('⚠️  Nenhum pedido encontrado para teste.');
      console.log('   Crie um pedido na aplicação primeiro.');
      return;
    }
    
    console.log(`✅ Encontrados ${orders.length} pedidos:`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ID: ${order.id} | Status: ${order.status} | Criado em: ${new Date(order.created_at).toLocaleString()}`);
    });
    
    // 5. Testar atualização de status
    const testOrder = orders.find(o => o.status === 'pending') || orders[0];
    console.log(`\n5. Testando atualização do pedido ${testOrder.id}...`);
    
    // Determinar próximo status baseado no atual
    let newStatus;
    switch (testOrder.status) {
      case 'pending':
        newStatus = 'approved';
        break;
      case 'approved':
        newStatus = 'delivered';
        break;
      case 'delivered':
        newStatus = 'received';
        break;
      default:
        newStatus = 'approved'; // Fallback
    }
    
    console.log(`   Tentando alterar status de '${testOrder.status}' para '${newStatus}'...`);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('order_requests')
      .update({ status: newStatus })
      .eq('id', testOrder.id)
      .select();
    
    if (updateError) {
      console.log('❌ Erro na atualização:', updateError.message);
      console.log('   Código do erro:', updateError.code);
      
      if (updateError.code === '42501') {
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('   - Erro 42501 = Permissão insuficiente');
        console.log('   - As políticas RLS podem não estar funcionando corretamente');
        console.log('   - Verifique se o script SQL foi executado completamente');
      }
    } else {
      console.log('✅ Atualização bem-sucedida!');
      console.log('   Resultado:', updateResult);
      
      // Reverter a alteração para não afetar os dados
      console.log('\n6. Revertendo alteração de teste...');
      const { error: revertError } = await supabase
        .from('order_requests')
        .update({ status: testOrder.status })
        .eq('id', testOrder.id);
      
      if (revertError) {
        console.log('⚠️  Erro ao reverter:', revertError.message);
      } else {
        console.log('✅ Status revertido com sucesso');
      }
    }
    
    // 7. Verificar políticas RLS
    console.log('\n7. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check')
      .eq('tablename', 'order_requests');
    
    if (policiesError) {
      console.log('⚠️  Não foi possível verificar políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas encontradas:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Se a atualização funcionou: ✅ Problema resolvido!');
    console.log('   2. Se houve erro 42501: Execute novamente o script SQL no painel do Supabase');
    console.log('   3. Teste na aplicação: Faça login como gestor e tente aprovar um pedido');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testGestorPermissions();