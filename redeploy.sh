#!/bin/bash

# Быстрый скрипт для повторного развертывания с исправлением портов

SERVER_IP="5.144.181.38"
SERVER_USER="root"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔄 Повторное развертывание с исправлением портов${NC}"
echo ""

# Проверка доступности сервера
echo -n "📡 Проверка сервера... "
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    echo -e "${RED}✗ Сервер недоступен!${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC}"

# Создание архива (только измененные файлы)
echo "📦 Создаем архив обновлений..."
tar -czf birdwatching-update.tar.gz \
    docker-compose.prod.yml \
    backend/env.production.example \
    frontend/env.production.example \
    ports.env

# Копирование на сервер
echo "📤 Копируем обновления на сервер..."
scp birdwatching-update.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Выполнение обновления на сервере
echo "🔄 Выполняем обновление на сервере..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e
    
    cd /opt/birdwatching
    
    echo "🛑 Останавливаем текущие контейнеры..."
    docker-compose -f docker-compose.prod.yml down || true
    
    echo "📦 Применяем обновления..."
    cd /tmp
    tar -xzf birdwatching-update.tar.gz -C /opt/birdwatching --overwrite
    cd /opt/birdwatching
    
    echo "🔧 Обновляем конфигурацию..."
    # Настраиваем порты
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    
    # Обновляем API URL
    cp frontend/env.production.example frontend/.env.local
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://5.144.181.38:$BACKEND_PORT|" frontend/.env.local
    
    echo "🚀 Запускаем приложение с новыми портами..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up --build -d
    
    echo "⏳ Ждем запуска сервисов..."
    sleep 20
    
    echo "🔍 Проверяем статус..."
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "✅ Обновление завершено!"
    echo "🌐 Приложение: http://5.144.181.38:8080"
    echo "📚 API: http://5.144.181.38:3010/api/docs"
    
ENDSSH

# Очистка
rm -f birdwatching-update.tar.gz

echo ""
echo -e "${GREEN}🎉 Повторное развертывание завершено!${NC}"
echo -e "${YELLOW}🌐 Теперь приложение доступно на порту 8080: http://$SERVER_IP:8080${NC}"

# Проверка результата
echo ""
echo "🔍 Проверяем результат..."
sleep 5
./check-server.sh



