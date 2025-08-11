import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugOrderStatus() {
  console.log('🔍 Debugando atualização de status de pedidos...');
  
  try {
    // 1. Verificar autenticação
    console.log('\n1️⃣ Verificando autenticação...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      console.log('❌ Usuário não autenticado. Faça login primeiro.');
      return;
    }
    console.log('✅ Usuário autenticado:', user.user.email);
    
    // 2. Verificar perfil do usuário
    console.log('\n2️⃣ Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    console.log('✅ Perfil do usuário:', profile);
    
    // 3. Buscar um pedido para teste
    console.log('\n3️⃣ Buscando pedidos para teste...');
    const { data: orders, error: ordersError } = await supabase
      .from('order_requests')
      .select('id, status, requester_name')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('⚠️ Nenhum pedido encontrado para teste');
      return;
    }
    
    console.log('✅ Pedidos encontrados:', orders.length);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ID: ${order.id.substring(0, 8)}... | Status: ${order.status} | Solicitante: ${order.requester_name}`);
    });
    
    // 4. Testar atualização direta
    const testOrder = orders[0];
    console.log(`\n4️⃣ Testando atualização direta no pedido ${testOrder.id.substring(0, 8)}...`);
    
    const now = new Date().toISOString();
    const updateData = {
      status: 'approved',
      approved_by: user.user.id,
      approved_at: now
    };
    
    const { data: updateResult, error: updateError } = await supabase
      .from('order_requests')
      .update(updateData)
      .eq('id', testOrder.id)
      .select();
    
    if (updateError) {
      console.log('❌ Erro na atualização direta:', updateError);
      console.log('   Código do erro:', updateError.code);
      console.log('   Mensagem:', updateError.message);
      
      // 5. Testar Edge Function como fallback
      if (updateError.code === '42501') {
        console.log('\n5️⃣ Testando Edge Function como fallback...');
        
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log('❌ Sessão não encontrada');
          return;
        }
        
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/update-order-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.session.access_token}`,
            },
            body: JSON.stringify({ 
              orderId: testOrder.id, 
              status: 'approved' 
            }),
          });
          
          console.log('📡 Status da resposta da Edge Function:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Erro na Edge Function:', errorText);
          } else {
            const result = await response.json();
            console.log('✅ Edge Function executada com sucesso:', result);
          }
        } catch (fetchError) {
          console.log('❌ Erro ao chamar Edge Function:', fetchError.message);
        }
      }
    } else {
      console.log('✅ Atualização direta bem-sucedida:', updateResult);
    }
    
    // 6. Verificar estado final
    console.log('\n6️⃣ Verificando estado final do pedido...');
    const { data: finalOrder, error: finalError } = await supabase
      .from('order_requests')
      .select('id, status, approved_by, approved_at')
      .eq('id', testOrder.id)
      .single();
    
    if (finalError) {
      console.log('❌ Erro ao verificar estado final:', finalError);
    } else {
      console.log('📊 Estado final do pedido:', finalOrder);
    }
    
    // 7. Verificar políticas RLS
    console.log('\n7️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
          FROM pg_policies 
          WHERE tablename = 'order_requests';
        `
      });
    
    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas RLS:', policiesError.message);
    } else {
      console.log('📋 Políticas RLS encontradas:', policies);
    }
    
  } catch (error) {
    console.error('❌ Erro geral durante o debug:', error);
  }
}

console.log('🚀 Iniciando debug de atualização de status...');
console.log('⚠️  IMPORTANTE: Certifique-se de estar logado no sistema antes de executar este script.');
console.log('\n📋 Este script irá:');
console.log('   1. Verificar sua autenticação');
console.log('   2. Verificar seu perfil de usuário');
console.log('   3. Buscar pedidos para teste');
console.log('   4. Testar atualização direta');
console.log('   5. Testar Edge Function (se necessário)');
console.log('   6. Verificar resultado final');
console.log('   7. Verificar políticas RLS');
console.log('\n▶️  Executando em 3 segundos...');

setTimeout(debugOrderStatus, 3000);