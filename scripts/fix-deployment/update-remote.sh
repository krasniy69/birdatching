#!/bin/bash

# Скрипт для обновления приложения BirdWatch на удаленном сервере
# Использование: ./update-remote.sh

echo "🚀 Обновление приложения BirdWatch на удаленном сервере..."

# Переходим в директорию проекта
cd /root/Birdwatching || { echo "❌ Директория /root/Birdwatching не найдена"; exit 1; }

echo "📁 Текущая директория: $(pwd)"

# Останавливаем контейнеры
echo "🛑 Останавливаем контейнеры..."
docker-compose down

# Получаем обновления из Git
echo "📥 Получаем обновления из Git..."
git pull origin main

# Пересобираем контейнеры с новыми изменениями
echo "🔨 Пересобираем контейнеры..."
docker-compose build --no-cache

# Запускаем контейнеры
echo "▶️ Запускаем контейнеры..."
docker-compose up -d

# Проверяем статус контейнеров
echo "📊 Проверяем статус контейнеров..."
docker-compose ps

# Проверяем логи на ошибки
echo "📋 Проверяем логи..."
echo "=== Backend logs ==="
docker-compose logs --tail=20 backend

echo "=== Frontend logs ==="
docker-compose logs --tail=20 frontend

# Проверяем доступность приложения
echo "🌐 Проверяем доступность приложения..."
sleep 10
curl -I http://localhost:3011 || echo "❌ Frontend недоступен"
curl -I http://localhost:3010 || echo "❌ Backend недоступен"

echo "✅ Обновление завершено!"
echo "🌍 Приложение доступно по адресу: https://excursionapp.mywire.org"
