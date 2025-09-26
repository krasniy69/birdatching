# 🛠️ Полезные команды для управления BirdWatching

## 🚀 Развертывание и управление

### Развертывание
```bash
# Автоматическое развертывание
./deploy.sh

# Быстрое обновление
./redeploy.sh

# Исправление CORS
./fix-cors-rebuild.sh

# Исправление API URL
./fix-api-url-final.sh

# Полная пересборка
./force-refresh.sh
```

### Проверка состояния
```bash
# Общая проверка сервера
./check-server.sh

# Детальная диагностика CORS
./debug-cors-detailed.sh

# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверка логов всех сервисов
docker-compose -f docker-compose.prod.yml logs
```

## 🐳 Docker команды

### Управление контейнерами
```bash
# Запуск всех сервисов
FRONTEND_PORT=8080 BACKEND_PORT=3010 docker-compose -f docker-compose.prod.yml up -d

# Остановка всех сервисов
docker-compose -f docker-compose.prod.yml down

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.prod.yml restart [frontend|backend|postgres|redis]

# Пересборка с нуля
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Логи и отладка
```bash
# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Последние 20 строк логов
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

# Вход в контейнер
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec frontend sh
```

### Очистка ресурсов
```bash
# Очистка неиспользуемых ресурсов
docker system prune -f

# Удаление всех образов приложения
docker rmi birdwatching-frontend birdwatching-backend

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a -f --volumes
```

## 🗄️ База данных

### Подключение к PostgreSQL
```bash
# Подключение к базе
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching

# Список таблиц
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "\dt"

# Описание таблицы
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "\d excursions"
```

### Backup и восстановление
```bash
# Создание backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U birduser -d birdwatching > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U birduser -d birdwatching < backup.sql

# Выполнение SQL скрипта
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -f /docker-entrypoint-initdb.d/init.sql
```

### Проверка данных
```bash
# Количество записей в таблицах
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'excursions', COUNT(*) FROM excursions
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;"

# Проверка тестовых аккаунтов
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "SELECT email, role FROM users;"
```

## 🌐 Сетевая диагностика

### Проверка портов
```bash
# Проверка открытых портов
nmap -p 8080,3010,5432,6379 5.144.181.38

# Проверка конкретного порта
nc -zv 5.144.181.38 8080
nc -zv 5.144.181.38 3010
```

### HTTP тестирование
```bash
# Проверка фронтенда
curl -I http://5.144.181.38:8080

# Проверка API
curl -I http://5.144.181.38:3010/api/docs

# Тест авторизации
curl -X POST http://5.144.181.38:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@birdwatch.ru","password":"admin123"}'

# Тест CORS
curl -X OPTIONS http://5.144.181.38:3010/auth/login \
  -H "Origin: http://5.144.181.38:8080" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Получение токена для тестов
```bash
# Получить JWT токен
TOKEN=$(curl -s -X POST http://5.144.181.38:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@birdwatch.ru","password":"admin123"}' | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Использовать токен для запросов
curl -H "Authorization: Bearer $TOKEN" http://5.144.181.38:3010/excursions
```

## 🔧 Конфигурация и настройка

### Переменные окружения
```bash
# Просмотр переменных в контейнере
docker-compose -f docker-compose.prod.yml exec frontend printenv | grep NEXT_PUBLIC
docker-compose -f docker-compose.prod.yml exec backend printenv | grep DATABASE

# Обновление конфигурации
cp backend/env.production.example backend/.env
cp frontend/env.production.example frontend/.env.local
```

### Проверка JavaScript bundle
```bash
# Проверить API URL в фронтенде
APP_JS=$(curl -s http://5.144.181.38:8080 | grep -o '_next/static/chunks/pages/_app-[^"]*\.js' | head -1)
curl -s "http://5.144.181.38:8080/$APP_JS" | grep -o 'http://[^"]*3010'
```

## 🚨 Устранение неполадок

### Диагностика проблем
```bash
# Проверка использования ресурсов
docker stats

# Проверка места на диске
df -h

# Проверка процессов
docker-compose -f docker-compose.prod.yml top

# Проверка сети Docker
docker network ls
docker network inspect birdwatching_default
```

### Перезапуск сервисов
```bash
# Мягкий перезапуск
docker-compose -f docker-compose.prod.yml restart

# Жесткий перезапуск с пересборкой
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Перезапуск только проблемного сервиса
docker-compose -f docker-compose.prod.yml up -d --force-recreate backend
```

### Создание недостающих таблиц
```bash
# Если таблицы отсутствуют
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U birduser -d birdwatching << 'EOF'
-- Создание таблицы excursions
CREATE TABLE IF NOT EXISTS excursions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER NOT NULL DEFAULT 10,
    reserve INTEGER DEFAULT 0,
    "guideId" UUID NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2),
    duration INTEGER,
    "meetingPoint" TEXT,
    "meetingLatitude" DECIMAL(10, 8),
    "meetingLongitude" DECIMAL(11, 8),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY ("guideId") REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "excursionId" UUID NOT NULL,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "binocularNeeded" BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("excursionId") REFERENCES excursions(id) ON DELETE CASCADE
);
EOF
```

## 📊 Мониторинг

### Проверка здоровья системы
```bash
# Статус всех контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats --no-stream

# Проверка места на диске
du -sh /opt/birdwatching
du -sh /var/lib/docker

# Проверка логов на ошибки
docker-compose -f docker-compose.prod.yml logs | grep -i error
```

### Автоматические проверки
```bash
# Создать скрипт мониторинга
cat > /opt/birdwatching/health-check.sh << 'EOF'
#!/bin/bash
echo "=== Health Check $(date) ==="
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:8080
curl -s -o /dev/null -w "API: %{http_code}\n" http://localhost:3010/api/docs
docker-compose -f docker-compose.prod.yml ps
EOF

chmod +x /opt/birdwatching/health-check.sh
```

## 🔐 Безопасность

### Обновление паролей
```bash
# Сгенерировать новый JWT секрет
openssl rand -hex 32

# Обновить пароль базы данных
# 1. Изменить в docker-compose.prod.yml
# 2. Изменить в backend/.env
# 3. Пересоздать контейнеры
```

### Проверка безопасности
```bash
# Проверка открытых портов
nmap -sT -O localhost

# Проверка SSL (если настроен)
openssl s_client -connect 5.144.181.38:443 -servername your-domain.com
```

---

## 📞 Быстрая помощь

### Если приложение не работает:
1. `./check-server.sh` - общая диагностика
2. `docker-compose -f docker-compose.prod.yml logs` - проверить логи
3. `docker-compose -f docker-compose.prod.yml restart` - перезапуск
4. `./force-refresh.sh` - полная пересборка

### Если нужна помощь:
- Проверьте `DEPLOYMENT_TODO.md` для полного списка задач
- Используйте `DEPLOYMENT_CHECKLIST.md` для быстрой проверки
- Все скрипты находятся в корне проекта



