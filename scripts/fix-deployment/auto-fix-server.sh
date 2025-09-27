#!/usr/bin/expect -f

# Скрипт для автоматического исправления на сервере
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

# Переход в директорию проекта
send "cd /root/Birdwatching\r"
expect "# "

# Остановка контейнеров
send "docker-compose -f docker-compose.prod.yml down\r"
expect "# "

# Проверка статуса nginx
send "systemctl status nginx --no-pager\r"
expect "# "

# Перезапуск nginx
send "systemctl restart nginx\r"
expect "# "

# Пересборка фронтенда
send "docker-compose -f docker-compose.prod.yml build --no-cache frontend\r"
expect "# "

# Запуск контейнеров
send "docker-compose -f docker-compose.prod.yml up -d\r"
expect "# "

# Ожидание запуска
send "sleep 10\r"
expect "# "

# Проверка статуса контейнеров
send "docker ps\r"
expect "# "

# Проверка логов фронтенда
send "docker-compose -f docker-compose.prod.yml logs --tail=10 frontend\r"
expect "# "

# Проверка доступности API
send "curl -I https://excursionapp.mywire.org/auth/login\r"
expect "# "

# Завершение
send "echo 'Исправления применены успешно!'\r"
expect "# "

send "exit\r"
expect eof
