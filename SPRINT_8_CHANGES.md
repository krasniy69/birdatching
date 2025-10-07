# 📋 Спринт 8: Детали изменений

## Backend изменения

### 🆕 Новые файлы
Нет новых файлов

### ✏️ Измененные файлы

#### 1. `backend/env.example`
```diff
+ # Telegram Bot
+ TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
```

#### 2. `backend/package.json`
```diff
+ "axios": "^1.x.x"
```

#### 3. `backend/src/telegram/telegram.module.ts`
```typescript
// Добавлен импорт ConfigModule
imports: [
  TypeOrmModule.forFeature([User]),
+ ConfigModule,
]
```

#### 4. `backend/src/telegram/telegram.service.ts`
**Добавлено:**
- Импорт axios, ConfigService, Logger, UserRole
- ConfigService в constructor
- Bot Token из environment variables
- 10 новых методов для отправки уведомлений

**Новые методы:**
- `sendTelegramNotification()` - базовый метод отправки
- `sendNotificationToUser()` - отправка по userId
- `notifyParticipantBooked()` - уведомление о записи
- `notifyParticipantPromoted()` - уведомление о переводе
- `notifyParticipantCancelled()` - уведомление об отмене
- `notifyGuideNewBooking()` - уведомление экскурсоводу о записи
- `notifyGuideCancellation()` - уведомление экскурсоводу об отмене
- `notifyAdmins()` - массовая отправка админам
- `notifyAdminsNewBooking()` - уведомление админам о записи
- `notifyAdminsCancellation()` - уведомление админам об отмене

#### 5. `backend/src/bookings/bookings.module.ts`
```typescript
// Добавлен импорт TelegramModule
imports: [
  TypeOrmModule.forFeature([Booking, Excursion, User]),
+ TelegramModule,
]
```

#### 6. `backend/src/bookings/bookings.service.ts`
**Изменения в `createBooking()`:**
```typescript
+ // Отправляем уведомления
+ await this.telegramService.notifyParticipantBooked(userId, excursion.title, status, peopleCount);
+ await this.telegramService.notifyGuideNewBooking(excursion.guideId, ...);
+ await this.telegramService.notifyAdminsNewBooking(excursion.title, ...);
```

**Изменения в `cancelBooking()`:**
```typescript
// Расширены права доступа
+ const isOwner = booking.userId === userId;
+ const isAdmin = user.role === 'admin';
+ const isGuide = user.role === 'guide' && excursion.guideId === userId;
+ if (!isOwner && !isAdmin && !isGuide) { throw ForbiddenException; }

// Добавлены уведомления
+ await this.telegramService.notifyParticipantCancelled(...);
+ await this.telegramService.notifyGuideCancellation(...);
+ await this.telegramService.notifyAdminsCancellation(...);
```

**Изменения в `promoteFromReserve()`:**
```typescript
+ // Отправляем уведомление о переводе из резерва
+ await this.telegramService.notifyParticipantPromoted(reserveBooking.userId, excursion.title);
+ 
+ // Уведомляем экскурсовода о новом подтвержденном участнике
+ await this.telegramService.notifyGuideNewBooking(excursion.guideId, ...);
```

## Frontend изменения

### ✏️ Измененные файлы

#### 1. `frontend/src/pages/guide/excursions/[id]/participants.tsx`

**Добавлено в state:**
```typescript
+ const [cancellingId, setCancellingId] = useState<string | null>(null);
+ const { cancelBooking } = useBookings();
```

**Новая функция:**
```typescript
+ const handleCancelBooking = async (bookingId: string, participantName: string) => {
+   if (!confirm(`Вы уверены, что хотите отменить запись участника ${participantName}?`)) {
+     return;
+   }
+   try {
+     setCancellingId(bookingId);
+     await cancelBooking(bookingId);
+     await fetchData(id);
+   } catch (error: any) {
+     alert(error.message);
+   } finally {
+     setCancellingId(null);
+   }
+ };
```

**Изменения в таблицах:**
```typescript
// Добавлена колонка "Действия" в обе таблицы (подтвержденные и резерв)
+ <th>Действия</th>

// Добавлена кнопка отмены для каждого участника
+ <Button
+   size="sm"
+   variant="outline"
+   onClick={() => handleCancelBooking(booking.id, participantName)}
+   disabled={cancellingId === booking.id}
+   className="text-red-600 border-red-300 hover:bg-red-50"
+ >
+   {cancellingId === booking.id ? 'Отменяем...' : 'Отменить'}
+ </Button>
```

## Архитектура системы уведомлений

```
┌─────────────────────────────────────────────────────────────┐
│                     Событие в системе                        │
│  (Запись на экскурсию / Отмена / Перевод из резерва)        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BookingsService                            │
│  • createBooking()                                           │
│  • cancelBooking()                                           │
│  • promoteFromReserve()                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  TelegramService                             │
│  • notifyParticipant*()                                      │
│  • notifyGuide*()                                            │
│  • notifyAdmins*()                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Telegram Bot API                            │
│  POST https://api.telegram.org/bot{token}/sendMessage       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Пользователь                               │
│  Получает уведомление в Telegram                             │
└─────────────────────────────────────────────────────────────┘
```

## Примеры уведомлений

### 1. Участнику - запись подтверждена
```
✅ Ваша запись подтверждена!

🦅 Экскурсия: Наблюдение за водоплавающими птицами
👥 Количество человек: 2

С нетерпением ждем вас на экскурсии!
```

### 2. Участнику - в резерве
```
🕐 Вы в резерве

🦅 Экскурсия: Хищные птицы в городе
👥 Количество человек: 1

Вы будете переведены в основную группу при освобождении мест.
```

### 3. Участнику - переход из резерва
```
🎉 Отличная новость!

Вы переведены из резерва в основную группу!

🦅 Экскурсия: Перелетные птицы весной

Встретимся на экскурсии!
```

### 4. Экскурсоводу - новая запись
```
📝 Новая запись на экскурсию

🦅 Экскурсия: Птицы городских парков
👤 Участник: Иван Петров
👥 Количество человек: 3
✅ Статус: Подтверждено
```

### 5. Админам - отмена записи
```
📊 Отмена записи

🦅 Экскурсия: Ночные совы
👤 Участник: Мария Сидорова
```

## Диаграмма автоматизации резерва

```
┌──────────────────────────────────────────────────────┐
│  Отмена основной записи                              │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  promoteFromReserve()                                │
│  1. Подсчет подтвержденных участников                │
│  2. Проверка свободных мест                          │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  Поиск резервистов (ORDER BY createdAt ASC)          │
│  Находим первого, кто поместится                     │
└────────────────────┬─────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
      Есть место?        Нет места
              │             │
              ▼             ▼
┌─────────────────────┐  ┌────────────────┐
│ Перевод в CONFIRMED │  │ Ничего не      │
│ Сохранение в БД     │  │ делаем         │
└──────────┬──────────┘  └────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ Отправка уведомлений:                               │
│ • Участнику - о переводе                            │
│ • Экскурсоводу - о новом подтвержденном участнике   │
└─────────────────────────────────────────────────────┘
```

## Команды для запуска

### Установка зависимостей
```bash
cd backend
npm install
```

### Локальная разработка
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### Сборка production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Переменные окружения

### Backend (.env)
```bash
# Существующие переменные...

# Новое в Спринте 8
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz  # Получить у @BotFather
```

## Тестовый чеклист

- [ ] Backend компилируется без ошибок
- [ ] Frontend компилируется без ошибок
- [ ] Участник может записаться на экскурсию
- [ ] Участник получает уведомление о записи
- [ ] Экскурсовод получает уведомление о новом участнике
- [ ] Админы получают уведомление о новой записи
- [ ] Участник может отменить свою запись
- [ ] При отмене срабатывает автоперевод из резерва
- [ ] Резервист получает уведомление о переводе
- [ ] Экскурсовод может отменить запись участника
- [ ] Участник получает уведомление об отмене экскурсоводом
- [ ] Все уведомления приходят в Telegram с правильным форматированием

## Примечания

- Уведомления отправляются асинхронно и не блокируют основной поток
- При отсутствии Bot Token система работает без уведомлений (graceful degradation)
- Ошибки отправки логируются, но не прерывают выполнение операций
- HTML форматирование поддерживается в сообщениях (<b>, <i>, etc.)

