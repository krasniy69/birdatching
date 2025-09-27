#!/usr/bin/expect -f

# Проверка состояния сервера и поиск проекта
set timeout 60
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Проверяем текущее состояние
send "echo '=== ПРОВЕРКА СОСТОЯНИЯ СЕРВЕРА ==='\r"
expect "# "

send "pwd\r"
expect "# "

send "ls -la\r"
expect "# "

# Ищем директорию проекта
send "find /root -name 'docker-compose.prod.yml' 2>/dev/null\r"
expect "# "

send "find /home -name 'docker-compose.prod.yml' 2>/dev/null\r"
expect "# "

send "find /opt -name 'docker-compose.prod.yml' 2>/dev/null\r"
expect "# "

# Проверяем информацию о контейнерах
send "docker inspect birdwatching-frontend-1 | grep -A 5 -B 5 'Mounts'\r"
expect "# "

# Проверяем переменные окружения в контейнерах
send "docker exec birdwatching-frontend-1 env | grep NEXT_PUBLIC\r"
expect "# "

send "docker exec birdwatching-backend-1 env | grep -E '(NODE_ENV|PORT|DATABASE)'\r"
expect "# "

# Проверяем логи фронтенда на предмет ошибок API
send "docker logs birdwatching-frontend-1 --tail=50 | grep -i 'api\\|error\\|localhost'\r"
expect "# "

# Проверяем доступность API
send "curl -v https://excursionapp.mywire.org/auth/login 2>&1 | head -20\r"
expect "# "

send "echo '=== ПРОВЕРКА ЗАВЕРШЕНА ==='\r"
expect "# "

send "exit\r"
expect eof
