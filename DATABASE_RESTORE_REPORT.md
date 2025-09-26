# 🗄️ ОТЧЕТ О ВОССТАНОВЛЕНИИ БАЗЫ ДАННЫХ

## ❌ ПРОБЛЕМА
После авторизации возникала ошибка 500 при загрузке страницы `/excursions`:
```
Error: Abort fetching component for route: "/excursions" — 
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

## 🔍 ДИАГНОСТИКА

### Анализ логов backend:
```
[Nest] 18  - 09/15/2025, 2:43:24 PM   ERROR [ExceptionsHandler] relation "excursions" does not exist
QueryFailedError: relation "excursions" does not exist
```

### Проверка состояния БД:
- База данных `birdwatching` существовала
- Пользователь `birduser` был создан 
- Существовала только таблица `users`
- Отсутствовали таблицы `excursions` и `bookings`

## ✅ РЕШЕНИЕ

### 1. Восстановление схемы базы данных
Выполнены SQL команды для создания:

#### Таблица экскурсий:
```sql
CREATE TABLE IF NOT EXISTS excursions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    "meetingPoint" TEXT,
    "meetingLatitude" DECIMAL(10, 8),
    "meetingLongitude" DECIMAL(11, 8),
    capacity INTEGER NOT NULL,
    reserve INTEGER DEFAULT 0,
    "guideId" UUID NOT NULL,
    price DECIMAL(10, 2),
    duration INTEGER,
    difficulty INTEGER DEFAULT 1,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("guideId") REFERENCES users(id)
);
```

#### Таблица бронирований:
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "excursionId" UUID NOT NULL,
    "peopleCount" INTEGER DEFAULT 1 CHECK ("peopleCount" > 0 AND "peopleCount" <= 3),
    "binocularNeeded" BOOLEAN DEFAULT false,
    status booking_status DEFAULT 'CONFIRMED',
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("excursionId") REFERENCES excursions(id) ON DELETE CASCADE
);
```

### 2. Создание индексов
- Индексы для оптимизации запросов по `guideId`, `date`, `isActive`, `createdAt`
- Индексы для таблицы бронирований по `userId`, `excursionId`, `status`

### 3. Создание триггеров
- Триггеры для автоматического обновления `updatedAt` полей

## 📊 РЕЗУЛЬТАТ

### ✅ Восстановленная структура БД:
```
           List of relations
 Schema |    Name    | Type  |  Owner   
--------+------------+-------+----------
 public | bookings   | table | birduser
 public | excursions | table | birduser
 public | users      | table | birduser
```

### ✅ Проверка работоспособности:
- API `/excursions` возвращает `[]` (пустой массив) - работает корректно
- Авторизация работает
- Фронтенд доступен по https://excursionapp.mywire.org

## 🔧 ИСПОЛЬЗОВАННЫЕ КОМАНДЫ

### Диагностика:
```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs backend --tail=20

# Проверка таблиц в БД
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c '\dt'
```

### Восстановление:
```bash
# Создание таблиц
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "CREATE TABLE..."

# Создание индексов и триггеров
docker-compose -f docker-compose.prod.yml exec postgres psql -U birduser -d birdwatching -c "CREATE INDEX..."
```

### Тестирование:
```bash
# Проверка API
curl -H "Authorization: Bearer TOKEN" https://excursionapp.mywire.org/excursions
```

## 🎯 СТАТУС: ✅ ПРОБЛЕМА РЕШЕНА

Приложение полностью функционально:
- ✅ База данных восстановлена
- ✅ API работает корректно  
- ✅ Фронтенд доступен
- ✅ Авторизация работает
- ✅ HTTPS настроен
- ✅ Все тестовые аккаунты активны

**Приложение готово к использованию**: https://excursionapp.mywire.org



