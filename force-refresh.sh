#!/bin/bash

# Принудительное обновление с очисткой всех кэшей

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔄 Принудительное обновление приложения с очисткой кэшей..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /opt/birdwatching
    
    echo "🛑 Останавливаем все контейнеры..."
    docker-compose -f docker-compose.prod.yml down
    
    echo "🧹 Очищаем Docker кэши..."
    docker system prune -f
    docker builder prune -f
    
    echo "🗑️ Удаляем старые образы..."
    docker rmi birdwatching-frontend birdwatching-backend || true
    
    echo "🏗️ Полная пересборка без кэша..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml build --no-cache --pull
    
    echo "🚀 Запускаем приложение..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Ждем полного запуска..."
    sleep 30
    
    echo "🔍 Проверяем статус:"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "📋 Логи фронтенда:"
    docker-compose -f docker-compose.prod.yml logs frontend --tail=5
    
    echo ""
    echo "📋 Логи бэкенда:"
    docker-compose -f docker-compose.prod.yml logs backend --tail=5
    
ENDSSH

echo ""
echo "✅ Принудительное обновление завершено!"

# Финальная проверка
echo "🧪 Финальный тест CORS:"
curl -X POST http://5.144.181.38:3010/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://5.144.181.38:8080" \
  -d '{"email":"admin@birdwatch.ru","password":"admin123"}' \
  -s -o /dev/null -w "HTTP Status: %{http_code}\n"

echo ""
echo "🌐 Откройте приложение в НОВОЙ вкладке (или очистите кэш браузера):"
echo "   http://5.144.181.38:8080"
echo ""
echo "💡 Если ошибка остается:"
echo "   1. Откройте DevTools (F12)"
echo "   2. Перейдите в Network tab"
echo "   3. Включите 'Disable cache'"
echo "   4. Обновите страницу (Ctrl+F5)"




