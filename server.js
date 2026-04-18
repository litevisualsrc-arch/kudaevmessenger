const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

server.on('connection', (ws) => {
  console.log('✅ Подключился пользователь');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log(`📨 ${message.user}: ${message.text}`);
    
    // Отправляем всем подключённым
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });
});

console.log(`🚀 Сервер запущен на порту ${process.env.PORT || 8080}`);
