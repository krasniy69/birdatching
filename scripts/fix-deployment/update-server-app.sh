#!/usr/bin/expect -f

# Обновление приложения на сервере
set timeout 120
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Переходим в директорию проекта
send "cd /opt/birdwatching\r"
expect "# "

# Проверяем текущее состояние
send "echo '=== ТЕКУЩЕЕ СОСТОЯНИЕ ПРОЕКТА ==='\r"
expect "# "

send "pwd\r"
expect "# "

send "ls -la\r"
expect "# "

send "docker ps\r"
expect "# "

# Останавливаем контейнеры
send "echo '=== ОСТАНОВКА КОНТЕЙНЕРОВ ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml down\r"
expect "# "

# Создаем резервную копию текущего проекта
send "echo '=== СОЗДАНИЕ РЕЗЕРВНОЙ КОПИИ ==='\r"
expect "# "

send "cd /opt\r"
expect "# "

send "cp -r birdwatching birdwatching-backup-$(date +%Y%m%d-%H%M%S)\r"
expect "# "

send "cd birdwatching\r"
expect "# "

# Проверяем содержимое docker-compose.prod.yml
send "echo '=== ПРОВЕРКА КОНФИГУРАЦИИ ==='\r"
expect "# "

send "grep -A 10 -B 5 'NEXT_PUBLIC_API_URL' docker-compose.prod.yml\r"
expect "# "

# Пересобираем фронтенд с правильными переменными
send "echo '=== ПЕРЕСБОРКА ФРОНТЕНДА ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml build --no-cache frontend\r"
expect "# "

# Пересобираем бэкенд
send "echo '=== ПЕРЕСБОРКА БЭКЕНДА ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml build --no-cache backend\r"
expect "# "

# Запускаем контейнеры
send "echo '=== ЗАПУСК КОНТЕЙНЕРОВ ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml up -d\r"
expect "# "

# Ждем запуска
send "sleep 15\r"
expect "# "

# Проверяем статус
send "echo '=== ПРОВЕРКА СТАТУСА ==='\r"
expect "# "

send "docker ps\r"
expect "# "

# Проверяем переменные окружения в новом контейнере
send "docker exec birdwatching-frontend-1 env | grep NEXT_PUBLIC\r"
expect "# "

# Проверяем логи фронтенда
send "docker logs birdwatching-frontend-1 --tail=20\r"
expect "# "

# Проверяем логи бэкенда
send "docker logs birdwatching-backend-1 --tail=20\r"
expect "# "

# Тестируем API
send "echo '=== ТЕСТИРОВАНИЕ API ==='\r"
expect "# "

send "curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -I\r"
expect "# "

send "curl -I https://excursionapp.mywire.org\r"
expect "# "

send "echo '=== ОБНОВЛЕНИЕ ЗАВЕРШЕНО ==='\r"
expect "# "

send "exit\r"
expect eof
