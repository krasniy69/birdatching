#!/usr/bin/expect -f

# Параметры сервера
set SERVER "root@5.144.181.38"
set PASSWORD "7TdYGUmsPt3ao1"
set SERVER_PATH "/opt/birdatching"
set timeout 300

puts "\033\[1;33m=== Деплой обновлений на сервер ===\033\[0m\n"

puts "\033\[0;32m1. Копируем обновленные файлы на сервер...\033\[0m"

# Копируем backend контроллер
spawn scp -o StrictHostKeyChecking=no ./backend/src/categories/categories.controller.ts ${SERVER}:${SERVER_PATH}/backend/src/categories/categories.controller.ts
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}

# Копируем frontend страницу категорий
spawn scp -o StrictHostKeyChecking=no ./frontend/src/pages/categories/index.tsx ${SERVER}:${SERVER_PATH}/frontend/src/pages/categories/index.tsx
expect {
    "password:" {
        send "${PASSWORD}\r"
        expect eof
    }
    eof
}

puts "\n\033\[0;32m2. Перезапускаем контейнеры на сервере...\033\[0m"

# Подключаемся к серверу и перезапускаем контейнеры
spawn ssh -o StrictHostKeyChecking=no ${SERVER}
expect "password:"
send "${PASSWORD}\r"

expect "# "
send "cd ${SERVER_PATH}\r"

expect "# "
send "echo 'Пересобираем backend...'\r"

expect "# "
send "docker-compose -f docker-compose.prod.yml up -d --build --no-deps backend\r"

expect "# "
send "echo 'Пересобираем frontend...'\r"

expect "# "
send "docker-compose -f docker-compose.prod.yml up -d --build --no-deps frontend\r"

expect "# "
send "echo 'Проверяем статус контейнеров...'\r"

expect "# "
send "docker-compose -f docker-compose.prod.yml ps\r"

expect "# "
send "exit\r"

expect eof

puts "\n\033\[0;32m=== Деплой завершен! ===\033\[0m"
puts "\033\[1;33mПроверьте работу приложения: https://excursionapp.mywire.org/categories\033\[0m"

