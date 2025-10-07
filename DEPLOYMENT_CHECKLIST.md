# ✅ Чек-лист развертывания BirdWatching

## 🚀 Быстрая проверка готовности к развертыванию

### Перед развертыванием
- [ ] SSH доступ к серверу настроен
- [ ] Docker и Docker Compose установлены на сервере
- [ ] Порты 8080 и 3010 свободны на сервере
- [ ] Firewall настроен (разрешены порты 22, 8080, 3010)

### Файлы готовы
- [ ] `docker-compose.prod.yml` - с правильными портами и build args
- [ ] `frontend/Dockerfile` - принимает `ARG NEXT_PUBLIC_API_URL`
- [ ] `backend/src/main.ts` - CORS включает IP сервера
- [ ] `backend/src/database/init.sql` - содержит все таблицы
- [ ] `deploy.sh` - исполняемый скрипт развертывания

### Переменные окружения
- [ ] `FRONTEND_PORT=8080` (или другой свободный порт)
- [ ] `BACKEND_PORT=3010`
- [ ] `NEXT_PUBLIC_API_URL=http://IP:3010` в build args
- [ ] Уникальный `JWT_SECRET` в production

## 🎯 Команды для развертывания

### Автоматическое развертывание
```bash
./deploy.sh
```

### Ручное развертывание
```bash
# 1. Копирование файлов
scp -r . root@5.144.181.38:/opt/birdwatching/

# 2. Подключение к серверу
ssh root@5.144.181.38

# 3. Переход в директорию
cd /opt/birdwatching

# 4. Настройка переменных
cp backend/env.production.example backend/.env
cp frontend/env.production.example frontend/.env.local

# 5. Запуск
export FRONTEND_PORT=8080
export BACKEND_PORT=3010
FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔍 Проверка после развертывания

### Статус сервисов
```bash
docker-compose -f docker-compose.prod.yml ps
```
Должны быть запущены: postgres, redis, backend, frontend

### HTTP проверки
- [ ] `curl http://IP:8080` → HTTP 200 (фронтенд)
- [ ] `curl http://IP:3010/api/docs` → HTTP 200 (API docs)
- [ ] Авторизация в браузере работает

### База данных
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "\dt"
```
Должны быть таблицы: users, excursions, bookings

### Логи без ошибок
```bash
docker-compose -f docker-compose.prod.yml logs backend --tail=10
```

## 🧪 Тестовые аккаунты

После успешного развертывания проверить вход:
- **Админ**: admin@birdwatch.ru / admin123
- **Гид**: guide@birdwatch.ru / guide123
- **Пользователь**: user@birdwatch.ru / user123

## 🚨 Если что-то пошло не так

### Частые проблемы и решения

**CORS ошибка "Origin not allowed"**
```bash
# Проверить CORS настройки в backend/src/main.ts
# Пересобрать бэкенд:
docker-compose -f docker-compose.prod.yml build --no-cache backend
docker-compose -f docker-compose.prod.yml restart backend
```

**Ошибка 500 "relation does not exist"**
```bash
# Создать отсутствующие таблицы:
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -f /docker-entrypoint-initdb.d/init.sql
docker-compose -f docker-compose.prod.yml restart backend
```

**Фронтенд обращается к localhost вместо IP сервера**
```bash
# Пересобрать фронтенд с правильным API URL:
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml restart frontend
```

**Порт 80 занят**
```bash
# Использовать порт 8080:
export FRONTEND_PORT=8080
FRONTEND_PORT=8080 docker-compose -f docker-compose.prod.yml up -d
```

### Полная пересборка
```bash
# Если ничего не помогает:
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Полезные скрипты
- `./check-server.sh` - проверка состояния сервера
- `./debug-cors-detailed.sh` - диагностика CORS
- `./force-refresh.sh` - полная пересборка

---

## 📞 Поддержка

При проблемах:
1. Проверить логи: `docker-compose -f docker-compose.prod.yml logs [service]`
2. Запустить диагностику: `./check-server.sh`
3. Проверить документацию: `DEPLOYMENT.md` и `DEPLOYMENT_TODO.md`




