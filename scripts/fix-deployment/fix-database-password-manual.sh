#!/usr/bin/expect -f

set timeout 30

spawn ssh -o StrictHostKeyChecking=no root@5.144.181.38

expect "password:"
send "7TdYGUmsPt3ao1\r"

expect "#"

send "cd /opt/birdwatching\r"
expect "#"

send "echo '=== ПРОВЕРКА ТЕКУЩЕГО ПАРОЛЯ ==='\r"
expect "#"

send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "#"

send "echo '=== РУЧНОЕ ИСПРАВЛЕНИЕ ПАРОЛЯ ==='\r"
expect "#"

send "sed -i 's/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/DATABASE_PASSWORD=birdpass123/g' docker-compose.prod.yml\r"
expect "#"

send "echo '=== ПРОВЕРКА ИЗМЕНЕНИЙ ==='\r"
expect "#"

send "grep -A 5 -B 5 'DATABASE_PASSWORD' docker-compose.prod.yml\r"
expect "#"

send "echo '=== ОСТАНОВКА КОНТЕЙНЕРОВ ==='\r"
expect "#"

send "docker-compose -f docker-compose.prod.yml down\r"
expect "#"

send "echo '=== ЗАПУСК КОНТЕЙНЕРОВ ==='\r"
expect "#"

send "docker-compose -f docker-compose.prod.yml up -d\r"
expect "#"

send "sleep 30\r"
expect "#"

send "echo '=== ПРОВЕРКА ЛОГОВ БЭКЕНДА ==='\r"
expect "#"

send "docker logs birdwatching-backend-1 --tail=20\r"
expect "#"

send "echo '=== ТЕСТИРОВАНИЕ API ==='\r"
expect "#"

send "curl -I https://excursionapp.mywire.org\r"
expect "#"

send "curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -v\r"
expect "#"

send "echo '=== ИСПРАВЛЕНИЕ ЗАВЕРШЕНО ==='\r"
expect "#"

send "exit\r"
expect eof
