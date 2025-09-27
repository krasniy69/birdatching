#!/bin/bash

# Скрипт для исправления маршрутизации API на удаленном сервере
# Пароль: 7TdYGUmsPt3ao1

SERVER="root@5.144.181.38"
PASSWORD="7TdYGUmsPt3ao1"

echo "🔧 Исправление маршрутизации API на удаленном сервере..."

# Функция для выполнения команд на сервере
run_remote() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Проверяем статус контейнеров
echo "📊 Проверяем статус контейнеров..."
run_remote "docker ps"

# Останавливаем контейнеры
echo "⏹️ Останавливаем контейнеры..."
run_remote "cd /root/Birdwatching && docker-compose -f docker-compose.prod.yml down"

# Пересобираем фронтенд с правильными переменными окружения
echo "🔨 Пересобираем фронтенд..."
run_remote "cd /root/Birdwatching && docker-compose -f docker-compose.prod.yml build --no-cache frontend"

# Запускаем контейнеры
echo "🚀 Запускаем контейнеры..."
run_remote "cd /root/Birdwatching && docker-compose -f docker-compose.prod.yml up -d"

# Проверяем логи фронтенда
echo "📋 Проверяем логи фронтенда..."
run_remote "cd /root/Birdwatching && docker-compose -f docker-compose.prod.yml logs frontend"

# Проверяем логи бэкенда
echo "📋 Проверяем логи бэкенда..."
run_remote "cd /root/Birdwatching && docker-compose -f docker-compose.prod.yml logs backend"

# Проверяем статус nginx
echo "🌐 Проверяем статус nginx..."
run_remote "systemctl status nginx"

# Перезапускаем nginx
echo "🔄 Перезапускаем nginx..."
run_remote "systemctl restart nginx"

echo "✅ Исправление завершено!"
echo "🌐 Проверьте приложение по адресу: https://excursionapp.mywire.org"
