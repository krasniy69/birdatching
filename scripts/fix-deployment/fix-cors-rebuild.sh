#!/bin/bash

# Полное исправление CORS с пересборкой бэкенда

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔧 Исправляем CORS с полной пересборкой бэкенда..."

# Создаем архив с исправленным бэкендом
tar -czf backend-cors-fix.tar.gz \
    backend/src/main.ts \
    backend/env.production.example \
    docker-compose.prod.yml

# Копируем на сервер
scp backend-cors-fix.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Применяем исправления
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /tmp
    tar -xzf backend-cors-fix.tar.gz -C /opt/birdwatching --overwrite
    cd /opt/birdwatching
    
    echo "🔧 Обновляем конфигурацию..."
    cp backend/env.production.example backend/.env
    
    echo "🛑 Останавливаем бэкенд..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml stop backend
    
    echo "🏗️ ПОЛНОСТЬЮ пересобираем бэкенд с новыми CORS настройками..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml build --no-cache backend
    
    echo "🚀 Запускаем бэкенд..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up -d backend
    
    echo "⏳ Ждем запуска бэкенда..."
    sleep 15
    
    echo "🔍 Проверяем логи бэкенда:"
    docker-compose -f docker-compose.prod.yml logs backend --tail=10
    
    echo ""
    echo "🧪 Тестируем CORS напрямую:"
    curl -X OPTIONS http://localhost:3010/auth/login \
      -H "Origin: http://5.144.181.38:8080" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: Content-Type" \
      -v 2>&1 | grep -E "(Access-Control|HTTP)" || echo "Ошибка CORS теста"
    
ENDSSH

# Очистка
rm -f backend-cors-fix.tar.gz

echo ""
echo "✅ Исправление применено!"

# Тестируем CORS извне
echo "🧪 Тестируем CORS с внешнего хоста:"
curl -X OPTIONS http://5.144.181.38:3010/auth/login \
  -H "Origin: http://5.144.181.38:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -s -I | grep -E "Access-Control" || echo "❌ CORS заголовки не найдены"

echo ""
echo "🔍 Финальная проверка:"
./check-server.sh



