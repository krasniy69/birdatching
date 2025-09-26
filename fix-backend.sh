#!/bin/bash

# Быстрое исправление проблемы с бэкендом (PostgreSQL)

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔧 Исправляем проблему с подключением к PostgreSQL..."

# Создание архива только с исправлениями
tar -czf backend-fix.tar.gz \
    docker-compose.prod.yml \
    backend/env.production.example

# Копирование на сервер
scp backend-fix.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Применение исправлений
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /tmp
    tar -xzf backend-fix.tar.gz -C /opt/birdwatching --overwrite
    cd /opt/birdwatching
    
    echo "🔄 Обновляем конфигурацию бэкенда..."
    cp backend/env.production.example backend/.env
    
    echo "🛑 Перезапускаем бэкенд..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up -d --force-recreate backend
    
    echo "⏳ Ждем запуска бэкенда..."
    sleep 10
    
    echo "🔍 Проверяем логи бэкенда..."
    docker-compose -f docker-compose.prod.yml logs backend --tail=10
    
ENDSSH

# Очистка
rm -f backend-fix.tar.gz

echo ""
echo "✅ Исправление применено!"
echo "🔍 Проверяем результат..."
sleep 5
./check-server.sh



