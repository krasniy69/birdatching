# Отчет об исправлении проблем развертывания приложения

## Обзор проблемы

При развертывании приложения Birdwatching на удаленном сервере `5.144.181.38` возникли следующие проблемы:

1. **CORS ошибка**: `XMLHttpRequest cannot load http://localhost:3010/auth/login due to access control checks`
2. **502 Bad Gateway**: Фронтенд недоступен через HTTPS
3. **Ошибка подключения к базе данных**: `password authentication failed for user "birduser"`

## Диагностика

### Серверная инфраструктура
- **Сервер**: `5.144.181.38` (Ubuntu 22.04.5 LTS)
- **Доступ**: SSH `root@5.144.181.38` (пароль: `7TdYGUmsPt3ao1`)
- **Домен**: `excursionapp.mywire.org`
- **SSL**: Let's Encrypt сертификат
- **Контейнеризация**: Docker + Docker Compose
- **Веб-сервер**: Nginx (порт 8080 → фронтенд)

### Структура проекта
```
/opt/birdwatching/
├── docker-compose.prod.yml
├── nginx.conf
├── frontend/
├── backend/
└── ...
```

## Решение проблем

### 1. Исправление пароля базы данных

**Проблема**: В `docker-compose.prod.yml` был указан неправильный пароль для PostgreSQL.

**Решение**:
```bash
# Замена старого пароля на новый
sed -i 's/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/DATABASE_PASSWORD=birdpass123/g' docker-compose.prod.yml
```

**Конфигурация базы данных**:
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: birdwatching
    POSTGRES_USER: birduser
    POSTGRES_PASSWORD: birdpass123  # Исправлено
```

### 2. Исправление проксирования Nginx

**Проблема**: Nginx был настроен на проксирование к порту 3011, но фронтенд работал на порту 8080.

**Решение**:
```bash
# Исправление активной конфигурации Nginx
sed -i 's/localhost:3011/127.0.0.1:8080/g' /etc/nginx/sites-available/birdwatching
```

**Конфигурация Nginx**:
```nginx
server {
    listen 443 ssl http2;
    server_name excursionapp.mywire.org;
    
    # SSL конфигурация
    ssl_certificate /etc/letsencrypt/live/excursionapp.mywire.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/excursionapp.mywire.org/privkey.pem;
    
    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:8080;  # Исправлено с 3011 на 8080
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Auth endpoints
    location /auth {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers для API
        add_header 'Access-Control-Allow-Origin' 'https://excursionapp.mywire.org';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Other backend endpoints
    location ~ ^/(excursions|bookings|users) {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers для API
        add_header 'Access-Control-Allow-Origin' 'https://excursionapp.mywire.org';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### 3. Настройка CORS

**Проблема**: Отсутствовали CORS заголовки для API endpoints.

**Решение**: Добавлены CORS заголовки в конфигурацию Nginx для всех API endpoints (`/auth`, `/excursions`, `/bookings`, `/users`).

## Docker конфигурация

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "8080:3011"  # Внешний порт 8080 → внутренний 3011
    environment:
      - NEXT_PUBLIC_API_URL=https://excursionapp.mywire.org
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3010:3010"
    environment:
      - DATABASE_URL=postgresql://birduser:birdpass123@postgres:5432/birdwatching
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=birdwatching
      - DATABASE_USERNAME=birduser
      - DATABASE_PASSWORD=birdpass123  # Исправлено
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=df311582b675c68e3732166dd0b9911d27dda72ddcfab67ac4095670316b147a
      - JWT_EXPIRES_IN=7d
      - JWT_REFRESH_EXPIRES_IN=30d
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=birdwatching
      - POSTGRES_USER=birduser
      - POSTGRES_PASSWORD=birdpass123  # Исправлено
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Порты и маршрутизация

### Схема портов
```
Internet (HTTPS:443) → Nginx → {
  / → Frontend (127.0.0.1:8080)
  /auth → Backend (127.0.0.1:3010)
  /api → Backend (127.0.0.1:3010)
  /excursions → Backend (127.0.0.1:3010)
  /bookings → Backend (127.0.0.1:3010)
  /users → Backend (127.0.0.1:3010)
}
```

### Docker порты
- **Frontend**: `8080:3011` (внешний:внутренний)
- **Backend**: `3010:3010`
- **PostgreSQL**: `5432` (только внутренний)
- **Redis**: `6379` (только внутренний)

## Скрипты для исправления

Все скрипты для исправления проблем находятся в директории `scripts/fix-deployment/`:

### Основные скрипты
- `fix-database-password-final.sh` - Исправление пароля базы данных
- `fix-nginx-and-db.sh` - Исправление Nginx и базы данных
- `fix-nginx-completely.sh` - Полное исправление Nginx
- `debug-nginx-final.sh` - Диагностика Nginx
- `check-final-status.sh` - Проверка финального статуса

### Диагностические скрипты
- `debug-port-8080.sh` - Диагностика порта 8080
- `check-server-status.sh` - Проверка статуса сервера
- `test-api-endpoints.sh` - Тестирование API endpoints

### Скрипты развертывания
- `update-server-app.sh` - Обновление приложения на сервере
- `deploy-api-fix.sh` - Развертывание исправлений API
- `fix-api-routing.sh` - Исправление маршрутизации API

## Результат

### До исправления
- ❌ CORS ошибка при авторизации
- ❌ 502 Bad Gateway для фронтенда
- ❌ Ошибка подключения к базе данных

### После исправления
- ✅ Фронтенд доступен: `https://excursionapp.mywire.org` (HTTP 200 OK)
- ✅ API работает: `https://excursionapp.mywire.org/auth/login` (HTTP 401 Unauthorized - нормально для неверных учетных данных)
- ✅ База данных подключена
- ✅ CORS настроен корректно

## Команды для применения исправлений

```bash
# 1. Подключение к серверу
ssh root@5.144.181.38

# 2. Переход в директорию проекта
cd /opt/birdwatching

# 3. Исправление пароля базы данных
sed -i 's/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/DATABASE_PASSWORD=birdpass123/g' docker-compose.prod.yml

# 4. Исправление Nginx
sed -i 's/localhost:3011/127.0.0.1:8080/g' /etc/nginx/sites-available/birdwatching

# 5. Проверка синтаксиса Nginx
nginx -t

# 6. Перезапуск Nginx
systemctl restart nginx

# 7. Перезапуск контейнеров
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 8. Проверка статуса
curl -I https://excursionapp.mywire.org
curl -X POST https://excursionapp.mywire.org/auth/login -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"test"}'
```

## Мониторинг

### Проверка статуса контейнеров
```bash
docker ps
```

### Проверка логов
```bash
# Логи фронтенда
docker logs birdwatching-frontend-1 --tail=20

# Логи бэкенда
docker logs birdwatching-backend-1 --tail=20

# Логи Nginx
tail -f /var/log/nginx/error.log
```

### Проверка портов
```bash
ss -tlnp | grep -E ':(3010|3011|8080)'
```

## Заключение

Все проблемы развертывания успешно решены:
1. **Пароль базы данных** исправлен в `docker-compose.prod.yml`
2. **Nginx настроен** на правильное проксирование к порту 8080
3. **CORS заголовки** добавлены для всех API endpoints
4. **Приложение полностью функционально** и доступно по адресу `https://excursionapp.mywire.org`

Приложение готово к использованию! 🚀
