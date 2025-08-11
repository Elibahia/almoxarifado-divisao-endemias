import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dbseigkbvnuhosbpygeh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunction() {
  console.log('🧪 TESTE DA EDGE FUNCTION');
  console.log('=' .repeat(50));
  
  try {
    // 1. Verificar se o usuário está autenticado
    console.log('\n1. Verificando autenticação...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      console.log('❌ Usuário não autenticado. Fazendo login...');
      
      // Tentar fazer login (substitua pelas credenciais corretas)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com', // Substitua pelo email correto
        password: 'admin123' // Substitua pela senha correta
      });
      
      if (loginError) {
        console.log('❌ Erro no login:', loginError.message);
        console.log('\n⚠️  Para testar, você precisa estar logado no sistema.');
        console.log('   Faça login na aplicação e execute este teste novamente.');
        return;
      }
      
      console.log('✅ Login realizado com sucesso');
    } else {
      console.log('✅ Usuário autenticado:', user.user.email);
    }
    
    // 2. Obter token de sessão
    console.log('\n2. Obtendo token de sessão...');
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.log('❌ Sessão não encontrada');
      return;
    }
    
    console.log('✅ Token obtido');
    
    // 3. Buscar um pedido para testar
    console.log('\n3. Buscando pedidos para teste...');
    const { data: orders, error: ordersError } = await supabase
      .from('order_requests')
      .select('id, status')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Erro ao buscar pedidos:', ordersError.message);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ Nenhum pedido encontrado para teste');
      console.log('   Crie um pedido primeiro para testar a atualização de status.');
      return;
    }
    
    const testOrder = orders[0];
    console.log('✅ Pedido encontrado:', testOrder.id.substring(0, 8), 'Status atual:', testOrder.status);
    
    // 4. Testar a Edge Function
    console.log('\n4. Testando Edge Function...');
    console.log('URL:', `${SUPABASE_URL}/functions/v1/update-order-status`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/update-order-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`,
      },
      body: JSON.stringify({ 
        orderId: testOrder.id, 
        status: testOrder.status === 'pending' ? 'approved' : 'pending'
      }),
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro da Edge Function:', errorText);
      
      if (response.status === 404) {
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('   A Edge Function não foi encontrada (404).');
        console.log('   Isso significa que ela não foi deployada no Supabase.');
        console.log('\n📋 SOLUÇÕES:');
        console.log('   1. Deploy via Supabase CLI:');
        console.log('      supabase functions deploy update-order-status');
        console.log('   2. Deploy via painel do Supabase:');
        console.log('      - Acesse o painel do Supabase');
        console.log('      - Vá em Edge Functions');
        console.log('      - Crie uma nova função chamada "update-order-status"');
        console.log('      - Cole o código do arquivo supabase/functions/update-order-status/index.ts');
      }
      
      return;
    }
    
    const result = await response.json();
    console.log('✅ Resposta da Edge Function:', result);
    
    // 5. Verificar se o status foi atualizado
    console.log('\n5. Verificando se o status foi atualizado...');
    const { data: updatedOrder } = await supabase
      .from('order_requests')
      .select('status')
      .eq('id', testOrder.id)
      .single();
    
    if (updatedOrder) {
      console.log('✅ Status atual do pedido:', updatedOrder.status);
      if (updatedOrder.status !== testOrder.status) {
        console.log('🎉 SUCESSO! O status foi atualizado via Edge Function!');
      } else {
        console.log('⚠️  O status não mudou. Pode haver um problema na lógica da Edge Function.');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro durante o teste:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Executar o teste
testEdgeFunction().then(() => {
  console.log('\n🏁 Teste concluído');
}).catch(console.error);