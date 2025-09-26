# 📋 TODO: Развертывание приложения BirdWatching на удаленном сервере

## 🔧 Подготовка сервера

### Системные требования
- [ ] Убедиться, что сервер работает на Ubuntu 22.04 LTS или новее
- [ ] Проверить наличие минимум 2GB RAM и 20GB свободного места
- [ ] Обновить систему: `sudo apt update && sudo apt upgrade -y`
- [ ] Перезагрузить сервер при необходимости

### Установка Docker
- [ ] Установить Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
- [ ] Добавить пользователя в группу docker: `sudo usermod -aG docker $USER`
- [ ] Включить автозапуск Docker: `sudo systemctl enable docker`
- [ ] Установить Docker Compose: 
  ```bash
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  ```

### Настройка безопасности
- [ ] Настроить firewall (ufw):
  ```bash
  sudo ufw allow ssh
  sudo ufw allow 80/tcp
  sudo ufw allow 8080/tcp
  sudo ufw allow 3010/tcp
  sudo ufw --force enable
  ```
- [ ] Настроить fail2ban для защиты от брутфорса
- [ ] Создать отдельного пользователя для приложения (опционально)

## 🔑 SSH и доступы

### SSH настройка
- [ ] Настроить SSH ключи вместо паролей
- [ ] Проверить SSH доступ: `ssh root@5.144.181.38`
- [ ] Отключить вход по паролю (после настройки ключей)

### Файловая система
- [ ] Создать директорию для приложения: `mkdir -p /opt/birdwatching`
- [ ] Настроить права доступа: `chown -R $USER:$USER /opt/birdwatching`

## 📦 Подготовка приложения

### Конфигурационные файлы
- [ ] Проверить наличие `docker-compose.prod.yml`
- [ ] Проверить наличие `backend/env.production.example`
- [ ] Проверить наличие `frontend/env.production.example`
- [ ] Проверить наличие `ports.env` для настройки портов

### Переменные окружения
- [ ] Установить `FRONTEND_PORT=8080` (если порт 80 занят)
- [ ] Установить `BACKEND_PORT=3010`
- [ ] Настроить `NEXT_PUBLIC_API_URL=http://IP:3010` в build args
- [ ] Изменить JWT_SECRET на уникальное значение
- [ ] Настроить пароли базы данных

### Docker файлы
- [ ] Убедиться, что `frontend/Dockerfile` принимает `ARG NEXT_PUBLIC_API_URL`
- [ ] Проверить `.dockerignore` файлы в frontend и backend
- [ ] Убедиться, что Dockerfile использует `RUN npm ci` (не `--only=production`)

## 🗄️ База данных

### PostgreSQL настройка
- [ ] Проверить наличие `backend/src/database/init.sql`
- [ ] Убедиться, что init.sql содержит CREATE TABLE для всех таблиц:
  - [ ] users (должна быть)
  - [ ] excursions (с полями для карт)
  - [ ] bookings (с правильными статусами)
- [ ] Проверить наличие тестовых аккаунтов в init.sql
- [ ] Настроить backup стратегию (опционально)

### Проверка схемы БД
- [ ] Убедиться, что поля в excursions соответствуют TypeORM entity:
  - [ ] meetingPoint, meetingLatitude, meetingLongitude
  - [ ] latitude, longitude для основной локации
- [ ] Проверить foreign key constraints
- [ ] Добавить индексы для производительности

## 🌐 Сетевые настройки

### CORS настройка
- [ ] Добавить IP сервера в allowedOrigins в `backend/src/main.ts`:
  ```javascript
  const allowedOrigins = [
    'http://localhost:3011',
    'http://5.144.181.38',
    'http://5.144.181.38:80',
    'http://5.144.181.38:8080',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  ```

### Проверка портов
- [ ] Убедиться, что порты не заняты:
  - [ ] 8080 (фронтенд)
  - [ ] 3010 (API)
  - [ ] 5432 (PostgreSQL, опционально)
  - [ ] 6379 (Redis, опционально)

### DNS настройка (опционально)
- [ ] Настроить доменное имя
- [ ] Настроить SSL сертификат (Let's Encrypt)
- [ ] Обновить CORS для домена

## 🚀 Развертывание

### Автоматическое развертывание
- [ ] Запустить `./deploy.sh` или использовать ручные команды
- [ ] Проверить успешную сборку всех образов
- [ ] Дождаться запуска всех контейнеров

### Ручное развертывание
- [ ] Скопировать файлы на сервер: `scp -r . root@IP:/opt/birdwatching/`
- [ ] Настроить переменные окружения:
  ```bash
  cp backend/env.production.example backend/.env
  cp frontend/env.production.example frontend/.env.local
  ```
- [ ] Собрать и запустить:
  ```bash
  FRONTEND_PORT=8080 BACKEND_PORT=3010 docker-compose -f docker-compose.prod.yml up --build -d
  ```

### Проверка развертывания
- [ ] Проверить статус контейнеров: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Проверить логи: `docker-compose -f docker-compose.prod.yml logs`
- [ ] Проверить доступность фронтенда: `curl http://IP:8080`
- [ ] Проверить API: `curl http://IP:3010/api/docs`

## ✅ Тестирование

### Функциональное тестирование
- [ ] Проверить авторизацию всех ролей:
  - [ ] admin@birdwatch.ru / admin123
  - [ ] guide@birdwatch.ru / guide123
  - [ ] user@birdwatch.ru / user123
- [ ] Создать тестовую экскурсию
- [ ] Проверить работу карт Yandex.Maps
- [ ] Протестировать бронирование
- [ ] Проверить административную панель

### Проверка производительности
- [ ] Проверить время загрузки страниц
- [ ] Протестировать под нагрузкой (опционально)
- [ ] Проверить использование ресурсов: `docker stats`

## 🔧 Настройка автозапуска

### Systemd сервис
- [ ] Создать systemd сервис для автозапуска:
  ```bash
  sudo tee /etc/systemd/system/birdwatching.service << EOF
  [Unit]
  Description=BirdWatching App
  Requires=docker.service
  After=docker.service

  [Service]
  Type=oneshot
  RemainAfterExit=yes
  WorkingDirectory=/opt/birdwatching
  ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
  ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
  TimeoutStartSec=0

  [Install]
  WantedBy=multi-user.target
  EOF
  ```
- [ ] Включить автозапуск: `sudo systemctl enable birdwatching.service`

## 📊 Мониторинг и логирование

### Логи
- [ ] Настроить ротацию логов Docker
- [ ] Настроить централизованное логирование (опционально)
- [ ] Проверить логи приложения: `docker-compose -f docker-compose.prod.yml logs -f`

### Мониторинг
- [ ] Настроить мониторинг ресурсов сервера
- [ ] Настроить алерты при падении сервисов (опционально)
- [ ] Проверить health checks контейнеров

## 🔐 Безопасность в production

### Секреты и пароли
- [ ] Изменить все дефолтные пароли
- [ ] Использовать сильный JWT_SECRET
- [ ] Настроить ротацию секретов (опционально)

### SSL/TLS
- [ ] Настроить HTTPS с Let's Encrypt (опционально)
- [ ] Настроить редирект с HTTP на HTTPS
- [ ] Обновить CORS для HTTPS

### Обновления
- [ ] Настроить автоматические обновления безопасности
- [ ] Планировать регулярные обновления приложения
- [ ] Создать процедуру backup перед обновлениями

## 📝 Backup и восстановление

### Backup стратегия
- [ ] Настроить backup базы данных:
  ```bash
  docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U birduser -d birdwatching > backup.sql
  ```
- [ ] Настроить backup файлов приложения
- [ ] Протестировать восстановление из backup

### Disaster Recovery
- [ ] Документировать процедуру восстановления
- [ ] Создать runbook для типичных проблем
- [ ] Настроить мониторинг доступности

## 🚨 Устранение неполадок

### Типичные проблемы
- [ ] Документировать решения для:
  - [ ] CORS ошибки
  - [ ] Проблемы с базой данных
  - [ ] Проблемы с портами
  - [ ] Ошибки сборки Docker
- [ ] Создать checklist для диагностики
- [ ] Подготовить команды для отладки

### Полезные команды
```bash
# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f [service]

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart [service]

# Полная пересборка
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Проверка базы данных
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "\dt"
```

## ✅ Финальная проверка

### Чек-лист готовности
- [ ] Все контейнеры запущены и healthy
- [ ] Фронтенд доступен на http://IP:8080
- [ ] API доступно на http://IP:3010/api/docs
- [ ] Авторизация работает для всех ролей
- [ ] База данных содержит все необходимые таблицы
- [ ] CORS настроен правильно
- [ ] Карты работают корректно
- [ ] Автозапуск настроен
- [ ] Backup настроен
- [ ] Документация обновлена

---

**📞 Поддержка**: При возникновении проблем используйте скрипты `check-server.sh` и `debug-cors-detailed.sh` для диагностики.



