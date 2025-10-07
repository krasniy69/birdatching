#!/usr/bin/expect -f

# Параметры сервера
set SERVER "root@5.144.181.38"
set PASSWORD "7TdYGUmsPt3ao1"
set SERVER_PATH "/opt/birdatching"
set timeout 600

puts "\033\[1;33m=== Деплой Sprint 8 на сервер ===\033\[0m\n"

puts "\033\[0;32m1. Подключаемся к серверу...\033\[0m"

spawn ssh -o StrictHostKeyChecking=no ${SERVER}
expect "password:"
send "${PASSWORD}\r"

expect "# "
send "cd ${SERVER_PATH}\r"

puts "\n\033\[0;32m2. Получаем обновления из Git...\033\[0m"

expect "# "
send "git fetch origin\r"

expect "# "
send "git pull origin main\r"

puts "\n\033\[0;32m3. Пересобираем backend...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml build backend\r"

expect "# "
sleep 2

puts "\n\033\[0;32m4. Пересобираем telegram-bot...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml build telegram-bot\r"

expect "# "
sleep 2

puts "\n\033\[0;32m5. Перезапускаем backend...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml up -d backend\r"

expect "# "
sleep 3

puts "\n\033\[0;32m6. Перезапускаем telegram-bot...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml up -d telegram-bot\r"

expect "# "
sleep 2

puts "\n\033\[0;32m7. Проверяем статус контейнеров...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml ps\r"

expect "# "
sleep 1

puts "\n\033\[0;32m8. Проверяем логи backend...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml logs backend --tail 20\r"

expect "# "
sleep 1

puts "\n\033\[0;32m9. Проверяем логи telegram-bot...\033\[0m"

expect "# "
send "docker-compose -f docker-compose.prod.yml logs telegram-bot --tail 20\r"

expect "# "
send "exit\r"

expect eof

puts "\n\033\[0;32m=== Деплой Sprint 8 завершен! ===\033\[0m"
puts "\033\[1;33mПроверьте работу приложения: https://excursionapp.mywire.org\033\[0m"
puts "\033\[1;33mТелеграм бот готов к работе!\033\[0m"

