# 🚀 Быстрый старт: Спринт 8

## Что нового в Спринте 8?

✅ Telegram уведомления для всех участников  
✅ Автоматическое управление резервом  
✅ Возможность отмены записи экскурсоводом  
✅ Уведомления админам и экскурсоводам  

## За 5 минут до запуска

### 1. Создайте Telegram Bot (1 минута)

```
1. Найдите @BotFather в Telegram
2. Отправьте: /newbot
3. Введите имя: BirdWatch Notifications
4. Введите username: birdwatch_notify_bot (или любой другой)
5. Скопируйте токен
```

### 2. Настройте Backend (1 минута)

Создайте/обновите `backend/.env`:

```bash
# Скопируйте из env.example если нужно
cp backend/env.example backend/.env

# Добавьте токен бота
echo "TELEGRAM_BOT_TOKEN=ваш-токен-здесь" >> backend/.env
```

### 3. Установите зависимости (2 минуты)

```bash
cd backend
npm install  # Установит axios и другие зависимости

cd ../frontend
npm install  # Если нужно
```

### 4. Запустите приложение (1 минута)

```bash
# Терминал 1 - Backend
cd backend
npm run start:dev

# Терминал 2 - Frontend
cd frontend
npm run dev

# Терминал 3 - PostgreSQL (если нужно)
docker-compose up -d postgres
```

## Быстрая проверка работы

### Проверка 1: Backend запущен

Откройте: http://localhost:3010/api/docs

В логах должно быть:
```
[NestApplication] Nest application successfully started
```

### Проверка 2: Telegram настроен

В логах backend ищите:
```
✅ [TelegramService] Telegram Bot Token configured
```

Или:
```
⚠️ [TelegramService] TELEGRAM_BOT_TOKEN не настроен
```

### Проверка 3: Frontend работает

Откройте: http://localhost:3011

Должна загрузиться главная страница.

## Тестирование уведомлений (5 минут)

### Шаг 1: Привяжите Telegram (2 минуты)

1. Войдите в приложение
2. Перейдите в Личный кабинет
3. Нажмите "Привязать Telegram"
4. Следуйте инструкциям

### Шаг 2: Тест записи на экскурсию (1 минута)

1. Перейдите на страницу экскурсий
2. Запишитесь на любую экскурсию
3. Проверьте Telegram - должно прийти уведомление:

```
✅ Ваша запись подтверждена!

🦅 Экскурсия: [название]
👥 Количество человек: 1

С нетерпением ждем вас на экскурсии!
```

### Шаг 3: Тест отмены (1 минута)

1. Перейдите в "Мои записи"
2. Нажмите "Отменить" на любой записи
3. Подтвердите отмену
4. Если на экскурсии был резерв - проверьте, что резервист получил уведомление о переводе

### Шаг 4: Тест для экскурсовода (1 минута)

Если у вас есть аккаунт экскурсовода:

1. Войдите как экскурсовод
2. Перейдите к своей экскурсии
3. Откройте "Участники"
4. Нажмите "Отменить" у любого участника
5. Проверьте, что участник получил уведомление

## Готово! 🎉

Теперь у вас работают:
- ✅ Telegram уведомления
- ✅ Автоматический резерв
- ✅ Управление записями для всех ролей

## Что если не работает?

### Уведомления не приходят?

**Проверьте:**
```bash
# 1. Токен в .env
cat backend/.env | grep TELEGRAM_BOT_TOKEN

# 2. Backend логи
# Должно быть: "Telegram Bot Token configured"

# 3. Привязан ли Telegram?
# Личный кабинет → Telegram должен показывать "Привязан"

# 4. Запущен ли бот?
# В Telegram отправьте боту /start
```

### Backend не запускается?

**Проверьте:**
```bash
# 1. Версия Node.js
node -v  # Должно быть >= 18

# 2. Зависимости установлены
cd backend && npm install

# 3. База данных доступна
docker-compose ps
```

### Frontend показывает ошибки?

**Проверьте:**
```bash
# 1. Backend запущен
curl http://localhost:3010/api/health

# 2. Правильный API URL
cat frontend/.env.local
# Должно быть: NEXT_PUBLIC_API_URL=http://localhost:3010
```

## Полезные команды

```bash
# Пересобрать backend
cd backend && npm run build

# Пересобрать frontend
cd frontend && npm run build

# Проверить логи
cd backend && npm run start:dev | grep Telegram

# Очистить кэш
rm -rf backend/dist
rm -rf frontend/.next

# Перезапустить БД
docker-compose restart postgres
```

## API для тестирования

### Создать запись

```bash
curl -X POST http://localhost:3010/excursions/{id}/book \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"peopleCount": 1, "binocularNeeded": false}'
```

### Отменить запись

```bash
curl -X DELETE http://localhost:3010/bookings/{id} \
  -H "Authorization: Bearer {token}"
```

### Проверить бота

```bash
curl https://api.telegram.org/bot{TOKEN}/getMe
```

## Структура проекта (после Спринта 8)

```
Birdwatching/
├── backend/
│   ├── src/
│   │   ├── telegram/
│   │   │   ├── telegram.service.ts  ← Обновлено (уведомления)
│   │   │   └── telegram.module.ts   ← Обновлено (ConfigModule)
│   │   └── bookings/
│   │       ├── bookings.service.ts  ← Обновлено (интеграция)
│   │       └── bookings.module.ts   ← Обновлено (TelegramModule)
│   ├── .env                         ← Добавлен TELEGRAM_BOT_TOKEN
│   └── package.json                 ← Добавлен axios
├── frontend/
│   └── src/
│       └── pages/
│           └── guide/
│               └── excursions/
│                   └── [id]/
│                       └── participants.tsx  ← Обновлено (кнопка отмены)
├── SPRINT_8_REPORT.md          ← Новый
├── SPRINT_8_CHANGES.md         ← Новый
├── TELEGRAM_SETUP_GUIDE.md     ← Новый
└── QUICK_START_SPRINT8.md      ← Этот файл
```

## Следующие шаги

После успешного тестирования:

1. ✅ Настройте production bot (отдельный токен)
2. ✅ Добавьте email уведомления (опционально)
3. ✅ Настройте мониторинг уведомлений
4. ✅ Создайте тестовые аккаунты для всех ролей
5. ✅ Задокументируйте процесс для команды

## Важные ссылки

- 📖 [Полный отчет Спринта 8](SPRINT_8_REPORT.md)
- 📋 [Детали изменений](SPRINT_8_CHANGES.md)
- 📱 [Настройка Telegram](TELEGRAM_SETUP_GUIDE.md)
- 🤖 [Telegram Bot API](https://core.telegram.org/bots/api)

## Поддержка

Если что-то не работает:
1. Проверьте логи backend и frontend
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию .env файлов
4. Обратитесь к подробным отчетам

---

**Приятной работы с новыми функциями! 🦅**

