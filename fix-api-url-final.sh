#!/bin/bash

# Финальное исправление API URL в фронтенде

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔧 ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ API URL"
echo "================================="

# Создаем архив с исправлениями
tar -czf final-fix.tar.gz \
    docker-compose.prod.yml \
    frontend/Dockerfile \
    frontend/env.production.example

# Копируем на сервер
scp final-fix.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Применяем исправления
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /tmp
    tar -xzf final-fix.tar.gz -C /opt/birdwatching --overwrite
    cd /opt/birdwatching
    
    echo "🔧 Обновляем конфигурацию..."
    cp frontend/env.production.example frontend/.env.local
    
    echo "🛑 Останавливаем приложение..."
    docker-compose -f docker-compose.prod.yml down
    
    echo "🗑️ Удаляем старые образы фронтенда..."
    docker rmi birdwatching-frontend || true
    
    echo "🏗️ Пересобираем фронтенд с правильным API URL..."
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    echo "   Используем API URL: http://5.144.181.38:$BACKEND_PORT"
    
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml build --no-cache frontend
    
    echo "🚀 Запускаем приложение..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Ждем запуска..."
    sleep 20
    
    echo "🔍 Проверяем статус:"
    docker-compose -f docker-compose.prod.yml ps
    
ENDSSH

# Очистка
rm -f final-fix.tar.gz

echo ""
echo "✅ Исправление применено!"

# Проверяем результат
echo "🧪 Проверяем API URL в новой сборке..."
sleep 5

APP_JS=$(curl -s http://5.144.181.38:8080 | grep -o '_next/static/chunks/pages/_app-[^"]*\.js' | head -1)
if [ ! -z "$APP_JS" ]; then
    API_URL=$(curl -s "http://5.144.181.38:8080/$APP_JS" | grep -o 'http://[^"]*3010' | head -1)
    echo "Найденный API URL в JavaScript: $API_URL"
    
    if [[ "$API_URL" == "http://5.144.181.38:3010" ]]; then
        echo "✅ API URL исправлен!"
    else
        echo "❌ API URL всё ещё неправильный"
    fi
else
    echo "⚠️ Не удалось найти JavaScript файл"
fi

echo ""
echo "🎉 ГОТОВО! Теперь попробуйте:"
echo "1. Откройте НОВУЮ вкладку: http://5.144.181.38:8080"
echo "2. Или нажмите Ctrl+F5 для принудительного обновления"
echo "3. Попробуйте войти: admin@birdwatch.ru / admin123"



