#!/bin/bash

# Исправление проблемы с подключением фронтенда к API

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔧 Исправляем проблему с подключением к API..."

# Создаем архив с исправлениями
tar -czf api-fix.tar.gz \
    docker-compose.prod.yml \
    frontend/env.production.example

# Копируем на сервер
scp api-fix.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Применяем исправления
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /tmp
    tar -xzf api-fix.tar.gz -C /opt/birdwatching --overwrite
    cd /opt/birdwatching
    
    echo "🔧 Обновляем конфигурацию фронтенда..."
    cp frontend/env.production.example frontend/.env.local
    
    echo "🛑 Останавливаем фронтенд..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml stop frontend
    
    echo "🏗️ Пересобираем фронтенд с правильными переменными..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml build --no-cache frontend
    
    echo "🚀 Запускаем фронтенд..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up -d frontend
    
    echo "⏳ Ждем запуска..."
    sleep 15
    
    echo "🔍 Проверяем статус:"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "📋 Логи фронтенда:"
    docker-compose -f docker-compose.prod.yml logs frontend --tail=5
    
ENDSSH

# Очистка
rm -f api-fix.tar.gz

echo ""
echo "✅ Исправление применено!"
echo "🔍 Проверяем результат..."
sleep 5

# Тестируем подключение
echo "🧪 Тестируем API через браузер..."
curl -s -X POST http://5.144.181.38:3010/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://5.144.181.38:8080" \
  -d '{"email":"admin@birdwatch.ru","password":"admin123"}' > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ API доступно с CORS заголовками"
else
    echo "❌ Проблема с API или CORS"
fi

./check-server.sh



