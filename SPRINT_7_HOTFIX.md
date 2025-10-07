# 🔥 Спринт 7: Hotfix - Решение ошибки 500

**Дата:** 28 сентября 2025  
**Проблема:** Ошибка 500 на странице экскурсий  
**Статус:** ✅ РЕШЕНА

## 🐛 Описание проблемы

При попытке загрузить страницу экскурсий возникала ошибка:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

## 🔍 Диагностика

### Логи бэкенда показали:
```
QueryFailedError: relation "categories" does not exist
QueryFailedError: relation "excursion_categories" does not exist
```

### Причина:
Таблицы для новых модулей категорий и подписок не были созданы в базе данных, хотя код был развернут.

## ✅ Решение

### 1. Создание недостающих таблиц

```sql
-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Промежуточная таблица экскурсии-категории
CREATE TABLE IF NOT EXISTS excursion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "excursionId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("excursionId") REFERENCES excursions(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE("excursionId", "categoryId")
);

-- Таблица подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE("userId", "categoryId")
);
```

### 2. Добавление тестовых данных

```sql
INSERT INTO categories (name, description, color, icon) VALUES 
    ('Птицы леса', 'Экскурсии по лесным массивам для наблюдения за лесными птицами', '#10B981', 'tree'),
    ('Водоплавающие', 'Наблюдение за водоплавающими птицами у водоемов', '#3B82F6', 'water'),
    ('Хищные птицы', 'Экскурсии для наблюдения за хищными птицами', '#EF4444', 'eagle'),
    ('Перелетные птицы', 'Наблюдение за миграцией птиц в сезонные периоды', '#F59E0B', 'bird'),
    ('Городские птицы', 'Экскурсии по городским паркам и скверам', '#8B5CF6', 'city')
ON CONFLICT (name) DO NOTHING;
```

### 3. Перезапуск бэкенда

```bash
docker restart birdwatching-backend-1
```

## 🛠️ Автоматизация

Создан скрипт `apply-migrations.sh` для автоматического применения миграций:

```bash
./apply-migrations.sh
```

## ✅ Результат

### Проверка API:
- ✅ `GET /categories` - возвращает 5 категорий
- ✅ `GET /excursions` - работает без ошибок
- ✅ `GET /subscriptions/my-with-categories` - возвращает категории с флагами подписки

### Проверка базы данных:
```sql
-- Таблицы
                List of relations
 Schema |         Name         | Type  |  Owner   
--------+----------------------+-------+----------
 public | bookings             | table | birduser
 public | categories           | table | birduser
 public | excursion_categories | table | birduser
 public | excursions           | table | birduser
 public | subscriptions        | table | birduser
 public | users                | table | birduser

-- Категории
                  id                  |       name       |  color  
--------------------------------------+------------------+---------
 4f5824fb-b62b-43e1-894b-7a7a459cf02a | Птицы леса       | #10B981
 29f12dbc-ded3-4443-b533-9c3ffb46291a | Водоплавающие    | #3B82F6
 4e8e354c-b604-4d43-ba1a-feb10be0d2ea | Хищные птицы     | #EF4444
 e262b48e-694d-4c5d-8bcf-f8ec23dde884 | Перелетные птицы | #F59E0B
 38cc78ea-1fcf-4fd3-8f2a-0f7a35f83ac7 | Городские птицы  | #8B5CF6
```

## 📚 Уроки

1. **Миграции базы данных** должны выполняться автоматически при развертывании
2. **Проверка зависимостей** - новые модули требуют соответствующих таблиц
3. **Автоматизация** - скрипты для применения миграций предотвращают подобные проблемы

## 🚀 Статус

**Приложение полностью функционально:**
- 🌐 Frontend: http://localhost:3011
- 🔧 Backend: http://localhost:3010
- 📚 API Docs: http://localhost:3010/api/docs

Все функции Спринта 7 работают корректно! ✅

