#!/bin/bash

# Скрипт для исправления маршрутизации API (запускать на сервере)
# Этот скрипт нужно скопировать на сервер и запустить там

echo "🔧 Исправление маршрутизации API..."

# Переходим в директорию проекта
cd /root/Birdwatching || { echo "❌ Директория /root/Birdwatching не найдена!"; exit 1; }

# Проверяем статус контейнеров
echo "📊 Текущий статус контейнеров:"
docker ps

# Останавливаем контейнеры
echo "⏹️ Останавливаем контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Проверяем переменные окружения в docker-compose.prod.yml
echo "🔍 Проверяем конфигурацию docker-compose.prod.yml:"
grep -A 10 "frontend:" docker-compose.prod.yml

# Пересобираем фронтенд с правильными переменными окружения
echo "🔨 Пересобираем фронтенд с переменной NEXT_PUBLIC_API_URL=https://excursionapp.mywire.org..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Запускаем контейнеры
echo "🚀 Запускаем контейнеры..."
docker-compose -f docker-compose.prod.yml up -d

# Ждем запуска контейнеров
echo "⏳ Ждем запуска контейнеров..."
sleep 10

# Проверяем статус контейнеров
echo "📊 Статус контейнеров после запуска:"
docker ps

# Проверяем логи фронтенда
echo "📋 Логи фронтенда:"
docker-compose -f docker-compose.prod.yml logs --tail=20 frontend

# Проверяем логи бэкенда
echo "📋 Логи бэкенда:"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

# Проверяем статус nginx
echo "🌐 Статус nginx:"
systemctl status nginx --no-pager

# Перезапускаем nginx
echo "🔄 Перезапускаем nginx..."
systemctl restart nginx

# Проверяем доступность API
echo "🔍 Проверяем доступность API endpoints:"
curl -I https://excursionapp.mywire.org/auth/login || echo "❌ API недоступен"

echo "✅ Исправление завершено!"
echo "🌐 Проверьте приложение по адресу: https://excursionapp.mywire.org"
echo "🔗 Проверьте API по адресу: https://excursionapp.mywire.org/auth/login"
