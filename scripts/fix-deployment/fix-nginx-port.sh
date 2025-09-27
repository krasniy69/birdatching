#!/usr/bin/expect -f

# Исправление порта nginx для фронтенда
set timeout 60
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Создаем резервную копию nginx конфигурации
send "cp /etc/nginx/sites-available/excursionapp /etc/nginx/sites-available/excursionapp.backup\r"
expect "# "

# Исправляем порт фронтенда в nginx конфигурации
send "sed -i 's/127.0.0.1:8080/127.0.0.1:3011/g' /etc/nginx/sites-available/excursionapp\r"
expect "# "

# Проверяем изменения
send "grep -n '127.0.0.1:3011' /etc/nginx/sites-available/excursionapp\r"
expect "# "

# Проверяем конфигурацию nginx
send "nginx -t\r"
expect "# "

# Перезапускаем nginx
send "systemctl reload nginx\r"
expect "# "

# Проверяем доступность фронтенда
send "curl -I http://localhost:3011\r"
expect "# "

# Проверяем доступность через nginx
send "curl -I https://excursionapp.mywire.org\r"
expect "# "

# Проверяем API через nginx
send "curl -I https://excursionapp.mywire.org/auth/login\r"
expect "# "

# Проверяем статус nginx
send "systemctl status nginx --no-pager\r"
expect "# "

send "echo 'Исправления применены успешно!'\r"
expect "# "

send "exit\r"
expect eof
