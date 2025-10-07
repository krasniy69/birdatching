#!/usr/bin/expect -f

# Финальная диагностика
set timeout 120
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Проверяем маппинг портов контейнеров
send "echo '=== ПРОВЕРКА ПОРТОВ ==='\r"
expect "# "

send "docker ps --format 'table {{.Names}}\t{{.Ports}}'\r"
expect "# "

# Проверяем доступность фронтенда на разных портах
send "echo '=== ТЕСТИРОВАНИЕ ПОРТОВ ==='\r"
expect "# "

send "curl -I http://localhost:8080\r"
expect "# "

send "curl -I http://localhost:3011\r"
expect "# "

# Проверяем логи nginx
send "echo '=== ЛОГИ NGINX ==='\r"
expect "# "

send "tail -10 /var/log/nginx/error.log\r"
expect "# "

# Проверяем конфигурацию nginx более детально
send "echo '=== КОНФИГУРАЦИЯ NGINX ==='\r"
expect "# "

send "grep -A 10 -B 5 'proxy_pass' /etc/nginx/sites-available/excursionapp\r"
expect "# "

# Проверяем статус контейнеров
send "echo '=== СТАТУС КОНТЕЙНЕРОВ ==='\r"
expect "# "

send "docker ps\r"
expect "# "

# Проверяем логи фронтенда
send "docker logs birdwatching-frontend-1 --tail=10\r"
expect "# "

# Проверяем логи бэкенда
send "docker logs birdwatching-backend-1 --tail=10\r"
expect "# "

send "echo '=== ДИАГНОСТИКА ЗАВЕРШЕНА ==='\r"
expect "# "

send "exit\r"
expect eof

