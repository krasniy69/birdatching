#!/bin/bash

# Скрипт для развертывания исправлений API маршрутизации
# Пароль: 7TdYGUmsPt3ao1

SERVER="root@5.144.181.38"
PASSWORD="7TdYGUmsPt3ao1"
PROJECT_DIR="/root/Birdwatching"

echo "🚀 Развертывание исправлений API маршрутизации..."

# Функция для выполнения команд на сервере
run_remote() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

# Копируем обновленные файлы на сервер
echo "📁 Копируем обновленные файлы на сервер..."

# Копируем docker-compose.prod.yml
scp -o StrictHostKeyChecking=no docker-compose.prod.yml "$SERVER:$PROJECT_DIR/"

# Копируем nginx.conf
scp -o StrictHostKeyChecking=no nginx.conf "$SERVER:/etc/nginx/sites-available/excursionapp"

# Копируем скрипт исправления на сервер
scp -o StrictHostKeyChecking=no fix-api-routing-remote.sh "$SERVER:$PROJECT_DIR/"

# Делаем скрипт исполняемым
run_remote "chmod +x $PROJECT_DIR/fix-api-routing-remote.sh"

# Проверяем конфигурацию nginx
echo "🔍 Проверяем конфигурацию nginx..."
run_remote "nginx -t"

# Если конфигурация корректна, перезапускаем nginx
if run_remote "nginx -t" > /dev/null 2>&1; then
    echo "✅ Конфигурация nginx корректна"
    run_remote "systemctl reload nginx"
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi

# Запускаем скрипт исправления на сервере
echo "🔧 Запускаем исправления на сервере..."
run_remote "cd $PROJECT_DIR && ./fix-api-routing-remote.sh"

echo "✅ Развертывание завершено!"
echo "🌐 Проверьте приложение по адресу: https://excursionapp.mywire.org"
echo "🔗 Проверьте API по адресу: https://excursionapp.mywire.org/auth/login"
