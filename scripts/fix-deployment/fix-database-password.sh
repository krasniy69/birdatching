#!/usr/bin/expect -f

# Исправление пароля базы данных
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

# Проверяем текущий пароль в docker-compose.prod.yml
send "echo '=== ПРОВЕРКА ПАРОЛЯ ==='\r"
expect "# "

send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "# "

# Исправляем пароль на правильный
send "echo '=== ИСПРАВЛЕНИЕ ПАРОЛЯ ==='\r"
expect "# "

send "sed -i 's/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/DATABASE_PASSWORD=birdpass123/g' docker-compose.prod.yml\r"
expect "# "

send "sed -i 's/POSTGRES_PASSWORD=tuGIAoL0cPMZs3mb/POSTGRES_PASSWORD=birdpass123/g' docker-compose.prod.yml\r"
expect "# "

send "sed -i 's/birduser:tuGIAoL0cPMZs3mb/birduser:birdpass123/g' docker-compose.prod.yml\r"
expect "# "

# Проверяем изменения
send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "# "

# Останавливаем контейнеры
send "echo '=== ОСТАНОВКА КОНТЕЙНЕРОВ ==='\r"
expect "# "

send "docker-compose -f docker-compose.prod.yml down\r"
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
send "docker ps\r"
expect "# "

# Проверяем логи бэкенда
send "docker logs birdwatching-backend-1 --tail=20\r"
expect "# "

# Тестируем API
send "echo '=== ТЕСТИРОВАНИЕ API ==='\r"
expect "# "

send "curl -I https://excursionapp.mywire.org\r"
expect "# "

send "curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -I\r"
expect "# "

send "echo '=== ИСПРАВЛЕНИЕ ЗАВЕРШЕНО ==='\r"
expect "# "

send "exit\r"
expect eof
