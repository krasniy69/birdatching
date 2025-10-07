# Быстрое исправление проблем развертывания

## 🚨 Экстренное исправление

Если приложение не работает, выполните следующие команды на сервере:

### 1. Подключение к серверу
```bash
ssh root@5.144.181.38
# Пароль: 7TdYGUmsPt3ao1
```

### 2. Переход в директорию проекта
```bash
cd /opt/birdwatching
```

### 3. Исправление пароля базы данных
```bash
sed -i 's/DATABASE_PASSWORD=tuGIAoL0cPMZs3mb/DATABASE_PASSWORD=birdpass123/g' docker-compose.prod.yml
```

### 4. Исправление Nginx
```bash
sed -i 's/localhost:3011/127.0.0.1:8080/g' /etc/nginx/sites-available/birdwatching
```

### 5. Перезапуск сервисов
```bash
# Проверка синтаксиса Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx

# Перезапуск контейнеров
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Проверка
```bash
# Проверка фронтенда
curl -I https://excursionapp.mywire.org

# Проверка API
curl -X POST https://excursionapp.mywire.org/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test"}'
```

## 📋 Ожидаемые результаты

- **Фронтенд**: `HTTP/1.1 200 OK`
- **API**: `HTTP/1.1 401 Unauthorized` (нормально для неверных учетных данных)

## 🔧 Автоматические скрипты

Используйте готовые скрипты из директории `scripts/fix-deployment/`:

```bash
# Полное исправление
./scripts/fix-deployment/fix-final-issues.sh

# Только база данных
./scripts/fix-deployment/fix-database-password-final.sh

# Только Nginx
./scripts/fix-deployment/fix-nginx-completely.sh

# Проверка статуса
./scripts/fix-deployment/check-final-status.sh
```

## 📞 Контакты

При проблемах обращайтесь к документации:
- `DEPLOYMENT_FIX_REPORT.md` - Подробный отчет
- `scripts/fix-deployment/README.md` - Описание скриптов

