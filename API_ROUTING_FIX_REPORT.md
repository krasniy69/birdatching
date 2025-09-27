# Отчет об исправлении маршрутизации API

## Проблема
При авторизации по URL `https://excursionapp.mywire.org/auth/login` возникала ошибка:
```
XMLHttpRequest cannot load http://localhost:3010/auth/login due to access control checks
```

## Анализ проблемы
1. **Фронтенд** пытается обратиться к `http://localhost:3010/auth/login` вместо `https://excursionapp.mywire.org/auth/login`
2. **Переменная окружения** `NEXT_PUBLIC_API_URL` не передается корректно в продакшн сборке
3. **CORS заголовки** в nginx не настроены для API endpoints

## Исправления

### 1. Обновлен nginx.conf
- Добавлены CORS заголовки для `/auth` endpoints
- Добавлены CORS заголовки для других API endpoints (`/excursions`, `/bookings`, `/users`)
- Настроена обработка preflight OPTIONS запросов

### 2. Созданы скрипты для исправления
- `fix-api-routing.sh` - скрипт для локального запуска исправлений
- `fix-api-routing-remote.sh` - скрипт для запуска на сервере
- `deploy-api-fix.sh` - скрипт для развертывания исправлений

## Инструкции по исправлению

### Вариант 1: Автоматическое исправление (рекомендуется)
```bash
# Запустите скрипт развертывания
./deploy-api-fix.sh
```

### Вариант 2: Ручное исправление на сервере
1. Подключитесь к серверу:
   ```bash
   ssh root@5.144.181.38
   # Пароль: 7TdYGUmsPt3ao1
   ```

2. Перейдите в директорию проекта:
   ```bash
   cd /root/Birdwatching
   ```

3. Скопируйте обновленные файлы:
   ```bash
   # Скопируйте nginx.conf в /etc/nginx/sites-available/excursionapp
   # Скопируйте docker-compose.prod.yml
   ```

4. Пересоберите и перезапустите контейнеры:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache frontend
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. Перезапустите nginx:
   ```bash
   systemctl restart nginx
   ```

## Проверка исправления

После применения исправлений проверьте:

1. **Статус контейнеров:**
   ```bash
   docker ps
   ```

2. **Логи фронтенда:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs frontend
   ```

3. **Логи бэкенда:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   ```

4. **Доступность API:**
   ```bash
   curl -I https://excursionapp.mywire.org/auth/login
   ```

5. **Тест авторизации:**
   - Откройте https://excursionapp.mywire.org/auth/login
   - Попробуйте авторизоваться
   - Проверьте Network tab в DevTools на наличие ошибок CORS

## Ожидаемый результат

После исправления:
- Фронтенд будет обращаться к `https://excursionapp.mywire.org/auth/login`
- CORS ошибки исчезнут
- Авторизация будет работать корректно
- API endpoints будут доступны через HTTPS

## Дополнительные улучшения

1. **Безопасность:** CORS заголовки настроены на `*` для разработки, в продакшене рекомендуется ограничить до конкретных доменов
2. **Мониторинг:** Добавлено логирование для отслеживания API запросов
3. **Производительность:** Настроено кэширование статических файлов

## Контакты
При возникновении проблем обращайтесь к разработчику или проверьте логи контейнеров.
