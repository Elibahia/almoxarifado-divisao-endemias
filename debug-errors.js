// Script para debug de erros na aplicação

// Capturar erros JavaScript não tratados
window.addEventListener('error', function(event) {
  console.error('Erro JavaScript capturado:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Capturar promises rejeitadas não tratadas
window.addEventListener('unhandledrejection', function(event) {
  console.error('Promise rejeitada não tratada:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Verificar conectividade com Supabase
async function testSupabaseConnection() {
  try {
    const response = await fetch('https://dbseigkbvnuhosbpygeh.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic2VpZ2tidm51aG9zYnB5Z2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjgyNDYsImV4cCI6MjA2Nzk0NDI0Nn0.r99c9IR-i9IXxSonzDdc80jCbRI9ZKPDShv3NZhtTac'
      }
    });
    console.log('Conexão com Supabase:', response.status === 200 ? 'OK' : 'ERRO');
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
  }
}

// Executar teste de conectividade
testSupabaseConnection();

console.log('Script de debug carregado. Monitorando erros...');