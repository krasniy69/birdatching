#!/usr/bin/expect -f

# Тестирование API endpoints
set timeout 60
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh -o StrictHostKeyChecking=no root@$server

expect "password:"
send "$password\r"

expect "# "

# Тестируем POST запрос к /auth/login
send "curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -v\r"
expect "# "

# Тестируем GET запрос к /auth/login (должен вернуть 404)
send "curl -X GET https://excursionapp.mywire.org/auth/login -v\r"
expect "# "

# Тестируем OPTIONS запрос (preflight)
send "curl -X OPTIONS https://excursionapp.mywire.org/auth/login -H 'Origin: https://excursionapp.mywire.org' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: Content-Type' -v\r"
expect "# "

# Проверяем доступность фронтенда
send "curl -I https://excursionapp.mywire.org\r"
expect "# "

# Проверяем доступность бэкенда напрямую
send "curl -X POST http://localhost:3010/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' -v\r"
expect "# "

send "echo 'Тестирование завершено!'\r"
expect "# "

send "exit\r"
expect eof
