FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Принимаем build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Собираем приложение с переменными окружения
RUN npm run build

# Открываем порт
EXPOSE 3011

# Запускаем приложение на порту 3011
CMD ["npm", "start", "--", "-p", "3011"]
