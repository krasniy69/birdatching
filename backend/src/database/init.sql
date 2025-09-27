-- Создание базы данных (если не существует)
-- CREATE DATABASE birdwatching;

-- Подключение к базе данных birdwatching
-- \c birdwatching;

-- Создание enum для ролей пользователей
CREATE TYPE user_role AS ENUM ('admin', 'guide', 'user');

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    "vkId" VARCHAR(255),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    telegramid VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_vk_id ON users("vkId");
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Создание триггера для автоматического обновления updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание первого администратора (пароль: admin123)
INSERT INTO users (email, "firstName", "lastName", password, role) 
VALUES (
    'admin@birdwatch.ru', 
    'Администратор', 
    'Системы', 
    '$2a$10$G3NUlu7XNdNc8RGlnasVge1/YwC2s6hMwXrursPAd5/99wsNttGNa', -- admin123
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Создание тестового экскурсовода (пароль: guide123)
INSERT INTO users (email, "firstName", "lastName", password, role) 
VALUES (
    'guide@birdwatch.ru', 
    'Иван', 
    'Орнитолог', 
    '$2a$10$G3NUlu7XNdNc8RGlnasVge1/YwC2s6hMwXrursPAd5/99wsNttGNa', -- guide123 (тот же хеш для простоты)
    'guide'
) ON CONFLICT (email) DO NOTHING;

-- Создание тестового пользователя (пароль: user123)
INSERT INTO users (email, "firstName", "lastName", password, role) 
VALUES (
    'user@birdwatch.ru', 
    'Мария', 
    'Любитель птиц', 
    '$2a$10$G3NUlu7XNdNc8RGlnasVge1/YwC2s6hMwXrursPAd5/99wsNttGNa', -- user123 (тот же хеш для простоты)
    'user'
) ON CONFLICT (email) DO NOTHING;

-- Создание таблицы экскурсий
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

-- Создание индексов для таблицы экскурсий
CREATE INDEX IF NOT EXISTS idx_excursions_guide_id ON excursions("guideId");
CREATE INDEX IF NOT EXISTS idx_excursions_date ON excursions(date);
CREATE INDEX IF NOT EXISTS idx_excursions_is_active ON excursions("isActive");
CREATE INDEX IF NOT EXISTS idx_excursions_created_at ON excursions("createdAt");

-- Создание триггера для обновления updatedAt в таблице excursions
CREATE TRIGGER update_excursions_updated_at 
    BEFORE UPDATE ON excursions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание enum для статусов бронирования
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'RESERVE', 'CANCELLED');

-- Создание таблицы бронирований
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

-- Создание индексов для таблицы бронирований
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings("userId");
CREATE INDEX IF NOT EXISTS idx_bookings_excursion_id ON bookings("excursionId");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings("createdAt");

-- Создание триггера для обновления updatedAt в таблице bookings
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание таблицы категорий экскурсий
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- hex цвет для UI
    icon VARCHAR(50), -- название иконки
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для таблицы категорий
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories("isActive");

-- Создание триггера для обновления updatedAt в таблице categories
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Создание таблицы связи экскурсий и категорий (многие ко многим)
CREATE TABLE IF NOT EXISTS excursion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "excursionId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("excursionId") REFERENCES excursions(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE("excursionId", "categoryId")
);

-- Создание индексов для таблицы excursion_categories
CREATE INDEX IF NOT EXISTS idx_excursion_categories_excursion_id ON excursion_categories("excursionId");
CREATE INDEX IF NOT EXISTS idx_excursion_categories_category_id ON excursion_categories("categoryId");

-- Создание таблицы подписок пользователей на категории
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE("userId", "categoryId")
);

-- Создание индексов для таблицы subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_category_id ON subscriptions("categoryId");

-- Добавление тестовых категорий
INSERT INTO categories (name, description, color, icon) VALUES 
    ('Птицы леса', 'Экскурсии по лесным массивам для наблюдения за лесными птицами', '#10B981', 'tree'),
    ('Водоплавающие', 'Наблюдение за водоплавающими птицами у водоемов', '#3B82F6', 'water'),
    ('Хищные птицы', 'Экскурсии для наблюдения за хищными птицами', '#EF4444', 'eagle'),
    ('Перелетные птицы', 'Наблюдение за миграцией птиц в сезонные периоды', '#F59E0B', 'bird'),
    ('Городские птицы', 'Экскурсии по городским паркам и скверам', '#8B5CF6', 'city')
ON CONFLICT (name) DO NOTHING;
