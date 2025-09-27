#!/bin/bash

echo "🔧 Быстрое исправление API URL..."

# Останавливаем только фронтенд
echo "⏹️ Останавливаем фронтенд..."
docker-compose -f docker-compose.prod.yml stop frontend

# Удаляем образ фронтенда
echo "🗑️ Удаляем образ фронтенда..."
docker rmi $(docker images | grep birdwatching_frontend | awk '{print $3}') 2>/dev/null || true

# Пересобираем только фронтенд
echo "🔨 Пересобираем фронтенд..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Запускаем фронтенд
echo "🚀 Запускаем фронтенд..."
docker-compose -f docker-compose.prod.yml up -d frontend

echo "✅ Готово! Фронтенд пересобран с правильными API URL"
echo "🌐 Проверьте авторизацию на: https://excursionapp.mywire.org"
