#!/usr/bin/expect -f

# Исправление финальных проблем
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

# Проверяем конфигурацию docker-compose.prod.yml
send "echo '=== ПРОВЕРКА КОНФИГУРАЦИИ ==='\r"
expect "# "

send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "# "

send "grep -A 5 -B 5 'POSTGRES_PASSWORD' docker-compose.prod.yml\r"
expect "# "

# Исправляем пароль базы данных
send "echo '=== ИСПРАВЛЕНИЕ ПАРОЛЯ БД ==='\r"
expect "# "

send "sed -i 's/DATABASE_PASSWORD=birdpass123/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/g' docker-compose.prod.yml\r"
expect "# "

send "sed -i 's/POSTGRES_PASSWORD=birdpass123/POSTGRES_PASSWORD=tuGIAoL0cPMZs3mb/g' docker-compose.prod.yml\r"
expect "# "

# Проверяем изменения
send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "# "

# Останавливаем контейнеры
send "echo '=== ОСТАНОВКА КОНТЕЙНЕРОВ ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml down\r"
expect "# "

# Пересобираем бэкенд с правильным паролем
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
send "sleep 30\r"
expect "# "

# Проверяем статус
send "echo '=== ПРОВЕРКА СТАТУСА ==='\r"
expect "# "

send "docker ps\r"
expect "# "

# Проверяем логи бэкенда
send "docker logs birdwatching-backend-1 --tail=20\r"
expect "# "

# Проверяем логи фронтенда
send "docker logs birdwatching-frontend-1 --tail=10\r"
expect "# "

# Проверяем доступность фронтенда напрямую
send "curl -I http://localhost:8080\r"
expect "# "

# Проверяем доступность через nginx
send "curl -I https://excursionapp.mywire.org\r"
expect "# "

# Тестируем API
send "curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -I\r"
expect "# "

send "echo '=== ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ ==='\r"
expect "# "

send "exit\r"
expect eof
