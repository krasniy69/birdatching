#!/bin/bash

# Скрипт для отладки проблем с подключением фронтенда к API

SERVER_IP="5.144.181.38"
SERVER_USER="root"

echo "🔍 Отладка проблемы с подключением фронтенда к API..."

# Проверяем переменные окружения фронтенда на сервере
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    cd /opt/birdwatching
    
    echo "📋 Текущие переменные окружения фронтенда:"
    cat frontend/.env.local || echo "Файл .env.local не найден"
    
    echo ""
    echo "🐳 Переменные окружения контейнера фронтенда:"
    docker-compose -f docker-compose.prod.yml exec frontend printenv | grep NEXT_PUBLIC || echo "NEXT_PUBLIC переменные не найдены"
    
    echo ""
    echo "🔍 Проверяем логи фронтенда:"
    docker-compose -f docker-compose.prod.yml logs frontend --tail=10
    
ENDSSH



