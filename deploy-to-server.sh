#!/usr/bin/expect -f

set timeout 60
set server "5.144.181.38"
set password "7TdYGUmsPt3ao1"

spawn ssh root@$server

expect "password:"
send "$password\r"

expect "#"

# Переходим в директорию проекта
send "cd /opt/birdwatching\r"
expect "#"

# Останавливаем контейнеры
send "echo '🔄 Останавливаем контейнеры...'\r"
expect "#"
send "docker compose -f docker-compose.prod.yml down\r"
expect "#"

# Обновляем код из репозитория
send "echo '📥 Обновляем код из репозитория...'\r"
expect "#"
send "git pull origin main\r"
expect "#"

# Применяем миграции базы данных
send "echo '📊 Применяем миграции базы данных...'\r"
expect "#"
send "docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c \"CREATE TABLE IF NOT EXISTS categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL UNIQUE, description TEXT, color VARCHAR(7) DEFAULT '#3B82F6', icon VARCHAR(50), \\\"isActive\\\" BOOLEAN DEFAULT true, \\\"createdAt\\\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \\\"updatedAt\\\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);\"\r"
expect "#"

send "docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c \"CREATE TABLE IF NOT EXISTS excursion_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), \\\"excursionId\\\" UUID NOT NULL, \\\"categoryId\\\" UUID NOT NULL, \\\"createdAt\\\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (\\\"excursionId\\\") REFERENCES excursions(id) ON DELETE CASCADE, FOREIGN KEY (\\\"categoryId\\\") REFERENCES categories(id) ON DELETE CASCADE, UNIQUE(\\\"excursionId\\\", \\\"categoryId\\\"));\"\r"
expect "#"

send "docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c \"CREATE TABLE IF NOT EXISTS subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), \\\"userId\\\" UUID NOT NULL, \\\"categoryId\\\" UUID NOT NULL, \\\"createdAt\\\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (\\\"userId\\\") REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (\\\"categoryId\\\") REFERENCES categories(id) ON DELETE CASCADE, UNIQUE(\\\"userId\\\", \\\"categoryId\\\"));\"\r"
expect "#"

send "docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c \"INSERT INTO categories (name, description, color, icon) VALUES ('Птицы леса', 'Экскурсии по лесным массивам для наблюдения за лесными птицами', '#10B981', 'tree'), ('Водоплавающие', 'Наблюдение за водоплавающими птицами у водоемов', '#3B82F6', 'water'), ('Хищные птицы', 'Экскурсии для наблюдения за хищными птицами', '#EF4444', 'eagle'), ('Перелетные птицы', 'Наблюдение за миграцией птиц в сезонные периоды', '#F59E0B', 'bird'), ('Городские птицы', 'Экскурсии по городским паркам и скверам', '#8B5CF6', 'city') ON CONFLICT (name) DO NOTHING;\"\r"
expect "#"

# Пересобираем и запускаем контейнеры
send "echo '🔨 Пересобираем и запускаем контейнеры...'\r"
expect "#"
send "docker compose -f docker-compose.prod.yml up --build -d\r"
expect "#"

# Ждем запуска сервисов
send "echo '⏳ Ждем запуска сервисов...'\r"
expect "#"
send "sleep 30\r"
expect "#"

# Проверяем статус контейнеров
send "echo '📊 Проверяем статус контейнеров:'\r"
expect "#"
send "docker ps\r"
expect "#"

# Проверяем логи бэкенда
send "echo '📋 Проверяем логи бэкенда:'\r"
expect "#"
send "docker logs birdwatching-backend-1 --tail 10\r"
expect "#"

# Проверяем доступность API
send "echo '🔍 Проверяем доступность API:'\r"
expect "#"
send "curl -s -o /dev/null -w '%{http_code}' http://localhost:3010/health || echo 'API check failed'\r"
expect "#"

# Проверяем Nginx
send "echo '🌐 Проверяем Nginx:'\r"
expect "#"
send "nginx -t\r"
expect "#"
send "systemctl reload nginx\r"
expect "#"

send "echo '✅ Деплой завершен успешно!'\r"
expect "#"
send "echo '🌐 Приложение доступно по адресу: https://excursionapp.mywire.org'\r"
expect "#"

send "exit\r"
expect eof
