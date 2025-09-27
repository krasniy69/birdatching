#!/usr/bin/expect -f

# Диагностика и исправление проблемы
set timeout 60
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Диагностика
send "echo '=== ДИАГНОСТИКА СЕРВЕРА ==='\r"
expect "# "

send "pwd\r"
expect "# "

send "ls -la\r"
expect "# "

send "docker ps\r"
expect "# "

send "docker logs birdwatching-frontend-1 --tail=10\r"
expect "# "

send "docker logs birdwatching-backend-1 --tail=10\r"
expect "# "

send "nginx -t\r"
expect "# "

send "curl -I https://excursionapp.mywire.org/auth/login\r"
expect "# "

send "curl -I http://localhost:3010/auth/login\r"
expect "# "

send "curl -I http://localhost:8080\r"
expect "# "

# Проверка переменных окружения в контейнере фронтенда
send "docker exec birdwatching-frontend-1 env | grep NEXT_PUBLIC\r"
expect "# "

# Проверка nginx конфигурации
send "cat /etc/nginx/sites-available/excursionapp | head -20\r"
expect "# "

send "echo '=== ДИАГНОСТИКА ЗАВЕРШЕНА ==='\r"
expect "# "

send "exit\r"
expect eof
