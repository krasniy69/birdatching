#!/bin/bash

echo "🔧 Исправление URL API для удаленного сервера..."

# Останавливаем контейнеры
echo "⏹️ Останавливаем контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Удаляем старые образы фронтенда
echo "🗑️ Удаляем старые образы фронтенда..."
docker rmi $(docker images | grep birdwatching_frontend | awk '{print $3}') 2>/dev/null || true

# Пересобираем фронтенд с правильными переменными окружения
echo "🔨 Пересобираем фронтенд с правильным API URL..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Запускаем контейнеры
echo "🚀 Запускаем контейнеры..."
docker-compose -f docker-compose.prod.yml up -d

# Проверяем статус
echo "📊 Проверяем статус контейнеров..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Готово! Фронтенд пересобран с правильным API URL: https://excursionapp.mywire.org"
echo "🌐 Приложение доступно по адресу: https://excursionapp.mywire.org"