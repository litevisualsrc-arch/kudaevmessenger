const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

server.on('connection', (ws) => {
  console.log('✅ Пользователь подключился');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log(`📨 ${message.user}: ${message.text}`);
    
    // Отправляем ВСЕМ подключенным пользователям
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });
  
  ws.on('close', () => {
    console.log('❌ Пользователь отключился');
  });
});

console.log(`🚀 WebSocket сервер запущен на порту ${process.env.PORT || 8080}`);
