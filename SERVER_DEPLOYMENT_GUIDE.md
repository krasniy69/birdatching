# 🚀 Инструкция по запуску приложения на удаленном сервере

## 📋 Информация о сервере

- **IP адрес:** `5.144.181.38`
- **Пользователь:** `root`
- **Пароль:** `7TdYGUmsPt3ao1`
- **Директория приложения:** `/opt/birdatching/`
- **Домен:** `excursionapp.mywire.org`

## 🔐 Подключение к серверу

```bash
ssh root@5.144.181.38
# Введите пароль: 7TdYGUmsPt3ao1
```

Или с автоматическим вводом пароля через expect:

```bash
#!/usr/bin/expect -f
spawn ssh -o StrictHostKeyChecking=no root@5.144.181.38
expect "password:"
send "7TdYGUmsPt3ao1\r"
interact
```

## 📂 Структура развертывания

```
/opt/birdatching/
├── backend/
├── frontend/
├── docker-compose.prod.yml
└── ...
```

## ✅ Проверка статуса приложения

### 1. Проверка всех контейнеров

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml ps
```

Должны быть запущены 4 контейнера:
- `birdatching-backend-1` - Backend API (порт 3010)
- `birdatching-frontend-1` - Frontend (порт 8080)
- `birdatching-postgres-1` - База данных PostgreSQL
- `birdatching-redis-1` - Redis кеш

### 2. Проверка статуса контейнеров

```bash
docker ps -a
```

### 3. Проверка Nginx

```bash
systemctl status nginx
```

## 🚀 Запуск приложения

### Запуск всех сервисов

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml up -d
```

Флаг `-d` запускает контейнеры в фоновом режиме (detached mode).

### Запуск конкретного сервиса

Если нужно запустить только один сервис (например, frontend):

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml up -d frontend
```

### Пересборка и запуск

Если были изменения в коде и нужна пересборка:

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml up -d --build
```

Или для конкретного сервиса:

```bash
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

## 🛑 Остановка приложения

### Остановка всех сервисов

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml down
```

### Остановка с удалением volumes (БД будет очищена!)

```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Остановка конкретного сервиса

```bash
docker-compose -f docker-compose.prod.yml stop frontend
```

## 🔄 Перезапуск приложения

### Перезапуск всех сервисов

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml restart
```

### Перезапуск конкретного сервиса

```bash
docker-compose -f docker-compose.prod.yml restart backend
```

## 📊 Просмотр логов

### Логи всех контейнеров

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml logs -f
```

Флаг `-f` включает режим follow (в реальном времени).

### Логи конкретного контейнера

```bash
# Backend
docker logs -f birdatching-backend-1

# Frontend
docker logs -f birdatching-frontend-1

# PostgreSQL
docker logs -f birdatching-postgres-1

# Redis
docker logs -f birdatching-redis-1
```

### Последние N строк логов

```bash
docker logs --tail 50 birdatching-backend-1
```

### Логи Nginx

```bash
# Ошибки
tail -f /var/log/nginx/error.log

# Доступ
tail -f /var/log/nginx/access.log
```

## 🧪 Проверка работоспособности

### 1. Проверка доступности локально на сервере

```bash
# Frontend
curl -I http://localhost:8080

# Backend
curl http://localhost:3010

# PostgreSQL
docker exec birdatching-postgres-1 pg_isready -U birduser
```

### 2. Проверка доступности извне

```bash
# С локального компьютера
curl -I https://excursionapp.mywire.org/
```

### 3. Проверка SSL сертификата

```bash
ls -la /etc/letsencrypt/live/excursionapp.mywire.org/
```

## 🔧 Устранение неполадок

### Проблема: Frontend не запускается

**Решение:**

```bash
cd /opt/birdatching
docker-compose -f docker-compose.prod.yml up -d frontend
docker logs -f birdatching-frontend-1
```

### Проблема: Backend не может подключиться к БД

**Проверка:**

```bash
# Проверить статус PostgreSQL
docker exec birdatching-postgres-1 pg_isready -U birduser -d birdwatching

# Проверить логи БД
docker logs birdatching-postgres-1 --tail 100
```

### Проблема: Ошибка "connect() failed (111: Unknown error)"

Это означает, что контейнер не запущен или не готов принимать соединения.

**Решение:**

```bash
# Проверить статус
docker-compose -f docker-compose.prod.yml ps

# Перезапустить проблемный сервис
docker-compose -f docker-compose.prod.yml restart frontend
```

### Проблема: Nginx не перенаправляет запросы

**Проверка конфигурации:**

```bash
# Проверить синтаксис
nginx -t

# Посмотреть активную конфигурацию
cat /etc/nginx/sites-available/birdwatching

# Перезагрузить Nginx
systemctl reload nginx
```

## 🔄 Обновление приложения

### 1. Получить последние изменения

```bash
cd /opt/birdatching
git pull origin main
```

### 2. Пересобрать и перезапустить

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Применить миграции БД (если есть)

```bash
docker exec birdatching-backend-1 npm run migration:run
```

## 📦 Управление образами и volumes

### Просмотр использования диска

```bash
docker system df
```

### Очистка неиспользуемых образов

```bash
docker image prune -a
```

### Очистка неиспользуемых volumes

```bash
docker volume prune
```

### Полная очистка системы (осторожно!)

```bash
docker system prune -a --volumes
```

## 🗄️ Резервное копирование базы данных

### Создание бэкапа

```bash
docker exec birdatching-postgres-1 pg_dump -U birduser birdwatching > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
cat backup.sql | docker exec -i birdatching-postgres-1 psql -U birduser -d birdwatching
```

## 🔍 Мониторинг ресурсов

### Использование ресурсов контейнерами

```bash
docker stats
```

### Использование диска

```bash
df -h
```

### Использование памяти

```bash
free -h
```

## 🌐 URLs и доступы

- **Frontend:** https://excursionapp.mywire.org/
- **Backend API:** https://excursionapp.mywire.org/api/
- **Auth:** https://excursionapp.mywire.org/auth/

## 📝 Переменные окружения

Переменные окружения настроены в файле `docker-compose.prod.yml`:

### Backend
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://birduser:birdpass123@postgres:5432/birdwatching`
- `PORT=3010`
- `JWT_SECRET` - секретный ключ для JWT

### Frontend
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://excursionapp.mywire.org`

## 🔒 Безопасность

### Порты

- **Открыты наружу:**
  - 80 (HTTP - редирект на HTTPS)
  - 443 (HTTPS)
  - 3010 (Backend API)
  - 8080 (Frontend)

- **Закрыты (внутри Docker сети):**
  - 5432 (PostgreSQL)
  - 6379 (Redis)

### SSL/TLS

Сертификаты Let's Encrypt автоматически обновляются через certbot.

Проверка срока действия:

```bash
certbot certificates
```

Обновление сертификата:

```bash
certbot renew
systemctl reload nginx
```

## 🆘 Быстрые команды для часто используемых операций

### Быстрая проверка "всё ли работает"

```bash
cd /opt/birdatching && \
docker-compose -f docker-compose.prod.yml ps && \
curl -I https://excursionapp.mywire.org/
```

### Быстрый рестарт после изменений

```bash
cd /opt/birdatching && \
git pull && \
docker-compose -f docker-compose.prod.yml up -d --build
```

### Посмотреть все логи с последнего часа

```bash
cd /opt/birdatching && \
docker-compose -f docker-compose.prod.yml logs --since 1h
```

## 📞 Контакты и поддержка

При возникновении проблем проверьте:
1. Логи контейнеров
2. Логи Nginx
3. Статус всех сервисов
4. Доступность портов

---

**Дата создания:** 7 октября 2025  
**Последнее обновление:** 7 октября 2025

