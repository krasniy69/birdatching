#!/bin/bash

echo "🔄 Применение миграций базы данных..."

# Проверяем, что контейнер PostgreSQL запущен
if ! docker ps | grep -q birdwatching-postgres-1; then
    echo "❌ Контейнер PostgreSQL не запущен. Запустите docker-compose up -d postgres"
    exit 1
fi

echo "📊 Создание таблицы categories..."
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    \"isActive\" BOOLEAN DEFAULT true,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);" > /dev/null 2>&1

echo "📊 Создание таблицы excursion_categories..."
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "
CREATE TABLE IF NOT EXISTS excursion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    \"excursionId\" UUID NOT NULL,
    \"categoryId\" UUID NOT NULL,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (\"excursionId\") REFERENCES excursions(id) ON DELETE CASCADE,
    FOREIGN KEY (\"categoryId\") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(\"excursionId\", \"categoryId\")
);" > /dev/null 2>&1

echo "📊 Создание таблицы subscriptions..."
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    \"userId\" UUID NOT NULL,
    \"categoryId\" UUID NOT NULL,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (\"userId\") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (\"categoryId\") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(\"userId\", \"categoryId\")
);" > /dev/null 2>&1

echo "🌱 Добавление тестовых категорий..."
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "
INSERT INTO categories (name, description, color, icon) VALUES 
    ('Птицы леса', 'Экскурсии по лесным массивам для наблюдения за лесными птицами', '#10B981', 'tree'),
    ('Водоплавающие', 'Наблюдение за водоплавающими птицами у водоемов', '#3B82F6', 'water'),
    ('Хищные птицы', 'Экскурсии для наблюдения за хищными птицами', '#EF4444', 'eagle'),
    ('Перелетные птицы', 'Наблюдение за миграцией птиц в сезонные периоды', '#F59E0B', 'bird'),
    ('Городские птицы', 'Экскурсии по городским паркам и скверам', '#8B5CF6', 'city')
ON CONFLICT (name) DO NOTHING;" > /dev/null 2>&1

echo "✅ Миграции успешно применены!"
echo "📋 Проверка таблиц:"
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "\dt"

echo "🎯 Проверка категорий:"
docker exec birdwatching-postgres-1 psql -U birduser -d birdwatching -c "SELECT name, color FROM categories;"
