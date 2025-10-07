#!/bin/bash

echo "🚀 Запуск локальной среды разработки..."

# Останавливаем production контейнеры если они запущены
echo "⏹️ Останавливаем production контейнеры..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Останавливаем локальные контейнеры
echo "⏹️ Останавливаем локальные контейнеры..."
docker-compose down

# Удаляем старые образы для чистой сборки
echo "🗑️ Удаляем старые образы..."
docker rmi $(docker images | grep birdwatching | awk '{print $3}') 2>/dev/null || true

# Запускаем локальную среду
echo "🔨 Собираем и запускаем локальную среду..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "✅ Локальная среда запущена!"
echo "🌐 Фронтенд: http://localhost:3011"
echo "🔧 Бэкенд: http://localhost:3010"
echo "🗄️ PostgreSQL: localhost:3012"
echo "📦 Redis: localhost:3013"
echo ""
echo "📚 API документация: http://localhost:3010/api/docs"

