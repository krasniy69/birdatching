#!/usr/bin/expect -f

# Скрипт для поиска проекта и применения исправлений
set timeout 30
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

# Подключение к серверу
spawn ssh -o StrictHostKeyChecking=no root@$server

# Ожидание запроса пароля
expect "password:"
send "$password\r"

# Ожидание промпта
expect "# "

# Поиск директории проекта
send "find /root -name 'docker-compose.prod.yml' 2>/dev/null\r"
expect "# "

# Поиск в других возможных местах
send "find /home -name 'docker-compose.prod.yml' 2>/dev/null\r"
expect "# "

# Поиск по имени контейнера
send "docker inspect birdwatching-frontend-1 | grep -i mount\r"
expect "# "

# Проверка текущих контейнеров
send "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'\r"
expect "# "

# Проверка логов фронтенда
send "docker logs birdwatching-frontend-1 --tail=20\r"
expect "# "

# Проверка логов бэкенда
send "docker logs birdwatching-backend-1 --tail=20\r"
expect "# "

# Проверка nginx конфигурации
send "nginx -t\r"
expect "# "

# Проверка доступности API
send "curl -v https://excursionapp.mywire.org/auth/login\r"
expect "# "

# Завершение
send "exit\r"
expect eof
