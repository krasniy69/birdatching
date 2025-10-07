# 🚀 Руководство по запуску BirdWatch

## Пошаговая инструкция для первого запуска

### 1. Подготовка окружения

Убедитесь, что у вас установлены:
- Node.js 18+ ([скачать](https://nodejs.org/))
- Docker Desktop ([скачать](https://www.docker.com/products/docker-desktop))
- Git

### 2. Установка зависимостей

```bash
# Установка зависимостей для всего проекта
npm run setup
```

### 3. Настройка переменных окружения

**Backend:**
```bash
cp backend/env.example backend/.env
```

**Frontend:**
```bash
cp frontend/env.local.example frontend/.env.local
```

### 4. Запуск базы данных

```bash
# Запуск PostgreSQL в Docker
npm run docker:up

# Проверка что контейнер запущен
docker ps
```

### 5. Запуск приложения

```bash
# Запуск фронтенда и бэкенда одновременно
npm run dev
```

**Или запуск по отдельности:**

```bash
# Терминал 1 - Backend
cd backend
npm run start:dev

# Терминал 2 - Frontend  
cd frontend
npm run dev
```

### 6. Проверка работы

Откройте в браузере:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🧪 Тестирование функционала

### Регистрация нового пользователя

1. Перейдите на http://localhost:3000
2. Нажмите "Начать путешествие" или "Регистрация"
3. Заполните форму:
   - Имя: Иван
   - Фамилия: Иванов
   - Email: test@example.com
   - Пароль: password123
4. Нажмите "Зарегистрироваться"
5. Вас должно перенаправить на страницу экскурсий

### Вход в систему

1. Перейдите на http://localhost:3000/auth/login
2. Введите данные:
   - Email: test@example.com
   - Пароль: password123
3. Нажмите "Войти"
4. Вас должно перенаправить на страницу экскурсий

### Проверка API

Используйте Swagger UI: http://localhost:3001/api/docs

Или curl команды:

```bash
# Регистрация
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123",
    "firstName": "Мария",
    "lastName": "Петрова"
  }'

# Вход
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com", 
    "password": "password123"
  }'
```

## 🔧 Устранение проблем

### База данных не запускается

```bash
# Остановить все контейнеры
npm run docker:down

# Очистить volumes (ВНИМАНИЕ: удалит все данные)
docker volume prune

# Запустить заново
npm run docker:up
```

### Порты заняты

Если порты 3000, 3001 или 5432 заняты:

1. Найдите процессы: `lsof -i :3000` (macOS/Linux)
2. Завершите процессы или измените порты в конфигурации

### Ошибки установки зависимостей

```bash
# Очистить кеш npm
npm cache clean --force

# Удалить node_modules и переустановить
rm -rf backend/node_modules frontend/node_modules
npm run setup
```

### Проблемы с TypeScript

```bash
# Backend
cd backend && npm run build

# Frontend  
cd frontend && npm run type-check
```

## 📊 Мониторинг

### Логи приложения

```bash
# Логи backend
cd backend && npm run start:dev

# Логи базы данных
docker logs birdwatching-postgres-1
```

### Проверка базы данных

```bash
# Подключение к PostgreSQL
docker exec -it birdwatching-postgres-1 psql -U birduser -d birdwatching

# Просмотр таблиц
\dt

# Просмотр пользователей
SELECT * FROM users;
```

## 🎯 Следующие шаги

После успешного запуска вы можете:

1. **Изучить код** - просмотрите структуру проекта
2. **Протестировать API** - используйте Swagger UI
3. **Настроить IDE** - установите расширения для TypeScript/React
4. **Изучить план** - ознакомьтесь с Roadmap.md для понимания дальнейшего развития

## 🆘 Получить помощь

При возникновении проблем:

1. Проверьте логи в консоли
2. Убедитесь, что все порты свободны
3. Проверьте версии Node.js и Docker
4. Создайте issue с описанием проблемы

Удачного использования BirdWatch! 🦅




