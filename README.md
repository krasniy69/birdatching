# BirdWatch - Приложение для орнитологических экскурсий

## 🦅 Описание проекта

BirdWatch — это веб-приложение для организации и управления орнитологическими экскурсиями. Приложение позволяет пользователям регистрироваться на экскурсии, а администраторам и экскурсоводам управлять мероприятиями.

## 🏗️ Архитектура

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, ShadcnUI
- **Backend**: NestJS, TypeScript, PostgreSQL, JWT
- **База данных**: PostgreSQL с Docker
- **Telegram Bot**: Node.js, node-telegram-bot-api
- **Стилизация**: Tailwind CSS с кастомной зеленой темой (#34A853)

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- Docker и Docker Compose
- npm или yarn

### Установка и запуск

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd Birdwatching
```

2. **Установка зависимостей**
```bash
npm run setup
```

3. **Настройка окружения**
```bash
# Backend
cp backend/env.example backend/.env
# Отредактируйте backend/.env при необходимости

# Frontend  
cp frontend/env.local.example frontend/.env.local
# Отредактируйте frontend/.env.local при необходимости
```

4. **Настройка Telegram бота (опционально)**
```bash
# Создайте бота у @BotFather в Telegram
# Скопируйте токен и добавьте в .env файл
echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" >> .env
```

5. **Запуск базы данных**
```bash
npm run docker:up
```

6. **Запуск приложения**
```bash
npm run dev
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## 📁 Структура проекта

```
Birdwatching/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Модуль аутентификации
│   │   ├── users/          # Модуль пользователей
│   │   ├── config/         # Конфигурация
│   │   └── database/       # База данных
│   └── package.json
├── frontend/               # Next.js приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы Next.js
│   │   ├── hooks/         # React хуки
│   │   ├── types/         # TypeScript типы
│   │   └── utils/         # Утилиты
│   └── package.json
├── docker-compose.yml      # Docker конфигурация
├── Roadmap.md             # План разработки
├── Ui-kit.md              # Дизайн-система
└── README.md
```

## 🎨 Дизайн-система

Приложение использует кастомную дизайн-систему на основе Tailwind CSS:

- **Основной цвет**: #34A853 (зеленый)
- **Вторичный цвет**: #F5F5F5 (светло-серый)
- **Шрифт**: Inter, Roboto
- **Компоненты**: ShadcnUI с кастомизацией

Подробности в [Ui-kit.md](./Ui-kit.md)

## 📋 Текущий статус (Спринт 6)

### ✅ Реализовано

- [x] Настройка проекта (фронтенд + бэкенд)
- [x] PostgreSQL с Docker
- [x] JWT аутентификация (регистрация, вход, refresh токены)
- [x] Формы входа и регистрации с валидацией
- [x] Базовый UI согласно дизайн-системе
- [x] Роутинг и навигация
- [x] Контекст аутентификации
- [x] Система ролей (админ, экскурсовод, участник)
- [x] CRUD экскурсий с картами
- [x] Система бронирования с резервом
- [x] Личные кабинеты для всех ролей
- [x] Статистика для администраторов
- [x] **Telegram интеграция** (привязка аккаунтов)
- [x] **Просмотр участников экскурсий** (админ/экскурсовод)
- [x] **Telegram бот** для генерации кодов привязки

### 🚧 В разработке

- [ ] VK OAuth интеграция
- [ ] Категории экскурсий и подписки
- [ ] Уведомления через Telegram
- [ ] Автоматизация управления резервом

## 🔧 Доступные команды

### Корневая директория
```bash
npm run dev          # Запуск фронтенда и бэкенда в dev режиме
npm run build        # Сборка фронтенда и бэкенда
npm run setup        # Установка зависимостей
npm run docker:up    # Запуск PostgreSQL в Docker
npm run docker:down  # Остановка Docker контейнеров
```

### Backend
```bash
cd backend
npm run start:dev    # Запуск в режиме разработки
npm run build        # Сборка
npm run start:prod   # Продакшн запуск
```

### Frontend
```bash
cd frontend  
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка
npm run start        # Продакшн запуск
```

### Telegram Bot
```bash
cd telegram-bot
npm install          # Установка зависимостей
npm run dev          # Запуск в режиме разработки
npm start            # Продакшн запуск
```

## 🔐 Аутентификация

Приложение использует JWT токены:
- Access Token: срок жизни 7 дней
- Refresh Token: срок жизни 30 дней
- Автоматическое обновление токенов
- Защищенные маршруты

## 📊 API Документация

Swagger документация доступна по адресу: http://localhost:3001/api/docs

### Основные эндпоинты:

- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/refresh` - Обновление токенов
- `GET /auth/profile` - Профиль пользователя

### Telegram API (Спринт 6)
- `POST /telegram/generate-code` - Генерация кода привязки
- `POST /telegram/link` - Привязка Telegram аккаунта
- `GET /telegram/status` - Статус привязки
- `DELETE /telegram/unlink` - Отвязка аккаунта

### Участники экскурсий (Спринт 6)
- `GET /excursions/:id/bookings` - Список участников (админ/экскурсовод)

## 🗂️ План развития

Подробный план разработки по спринтам доступен в [Roadmap.md](./Roadmap.md)

### Следующие спринты:
- **Спринт 2**: Роли и управление пользователями
- **Спринт 3**: CRUD экскурсий
- **Спринт 4**: Система бронирования
- **Спринт 5**: UI для ролей и дополнительные функции

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📝 Лицензия

MIT License



