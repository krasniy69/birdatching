# 🚀 Развертывание приложения BirdWatching

## Автоматическое развертывание

### Предварительные требования

1. **SSH доступ к серверу** `5.144.181.38`
2. **Docker и Docker Compose** на сервере (скрипт установит автоматически)
3. **Открытые порты** на сервере:
   - `80` - для фронтенда
   - `3010` - для API бэкенда
   - `5432` - для PostgreSQL (опционально, для внешнего доступа)
   - `6379` - для Redis (опционально, для внешнего доступа)

### Быстрое развертывание

```bash
# Запустить автоматическое развертывание
./deploy.sh
```

### Ручное развертывание

Если автоматический скрипт не работает, выполните следующие шаги:

#### 1. Подготовка файлов

```bash
# Создать архив проекта
tar -czf birdwatching.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=build \
    --exclude=*.log \
    .

# Скопировать на сервер
scp birdwatching.tar.gz root@5.144.181.38:/tmp/
```

#### 2. Развертывание на сервере

```bash
# Подключиться к серверу
ssh root@5.144.181.38

# Распаковать проект
cd /tmp
rm -rf /opt/birdwatching
mkdir -p /opt/birdwatching
tar -xzf birdwatching.tar.gz -C /opt/birdwatching
cd /opt/birdwatching

# Настроить переменные окружения
cp backend/env.production.example backend/.env
cp frontend/env.production.example frontend/.env.local

# Установить Docker (если не установлен)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установить Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Запустить приложение
docker-compose -f docker-compose.prod.yml up --build -d
```

#### 3. Проверка развертывания

```bash
# Проверить статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs

# Проверить доступность
curl http://localhost
curl http://localhost:3010/api/docs
```

## Доступ к приложению

После успешного развертывания приложение будет доступно по адресам:

- **Основное приложение**: http://5.144.181.38
- **API документация**: http://5.144.181.38:3010/api/docs
- **API endpoint**: http://5.144.181.38:3010

## Тестовые аккаунты

- **Администратор**: `admin@birdwatch.ru` / `admin123`
- **Экскурсовод**: `guide@birdwatch.ru` / `guide123`
- **Пользователь**: `user@birdwatch.ru` / `user123`

## Управление приложением

### Просмотр логов
```bash
ssh root@5.144.181.38 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml logs -f'
```

### Перезапуск приложения
```bash
ssh root@5.144.181.38 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml restart'
```

### Остановка приложения
```bash
ssh root@5.144.181.38 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml down'
```

### Обновление приложения
```bash
./deploy.sh
```

## Конфигурация Production

### Переменные окружения бэкенда (`backend/.env`)

```env
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=birdwatching
DATABASE_USER=birduser
DATABASE_PASSWORD=birdpass123
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
PORT=3010
FRONTEND_URL=http://5.144.181.38
```

### Переменные окружения фронтенда (`frontend/.env.local`)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://5.144.181.38:3010
```

## Безопасность

⚠️ **Важно для production:**

1. Смените JWT_SECRET на уникальное значение
2. Используйте сильные пароли для базы данных
3. Настройте SSL/TLS сертификаты
4. Настройте firewall для ограничения доступа к портам БД
5. Регулярно обновляйте зависимости

## Мониторинг

### Проверка здоровья сервисов
```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Логи в реальном времени
docker-compose -f docker-compose.prod.yml logs -f
```

### Backup базы данных
```bash
# Создать backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U birduser -d birdwatching > backup.sql

# Восстановить backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U birduser -d birdwatching < backup.sql
```

## Устранение неполадок

### Если контейнеры не запускаются
```bash
# Проверить логи
docker-compose -f docker-compose.prod.yml logs

# Пересобрать образы
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Если приложение недоступно
1. Проверьте, что порты открыты в firewall
2. Убедитесь, что контейнеры запущены
3. Проверьте логи на ошибки
4. Проверьте CORS настройки в бэкенде



