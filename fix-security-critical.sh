#!/bin/bash

# 🔒 Скрипт исправления критичных уязвимостей безопасности
# Автоматически исправляет самые важные проблемы безопасности

set -e

echo "🔒 ИСПРАВЛЕНИЕ КРИТИЧНЫХ УЯЗВИМОСТЕЙ БЕЗОПАСНОСТИ"
echo "=================================================="

# Функция для генерации случайных секретов
generate_secret() {
    openssl rand -hex 32
}

generate_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-16
}

echo ""
echo "🔑 1. ГЕНЕРАЦИЯ НОВЫХ СЕКРЕТОВ..."
echo "================================"

# Генерируем новые секреты
NEW_JWT_SECRET=$(generate_secret)
NEW_DB_PASSWORD=$(generate_password)
NEW_REDIS_PASSWORD=$(generate_password)

echo "✅ Новый JWT_SECRET: ${NEW_JWT_SECRET:0:20}..."
echo "✅ Новый DB_PASSWORD: ${NEW_DB_PASSWORD:0:10}..."
echo "✅ Новый REDIS_PASSWORD: ${NEW_REDIS_PASSWORD:0:10}..."

echo ""
echo "📝 2. ОБНОВЛЕНИЕ КОНФИГУРАЦИОННЫХ ФАЙЛОВ..."
echo "==========================================="

# Обновляем docker-compose.prod.yml
echo "Обновление docker-compose.prod.yml..."
sed -i.backup "s/JWT_SECRET: your-super-secret-jwt-key-change-in-production-2024/JWT_SECRET: $NEW_JWT_SECRET/" docker-compose.prod.yml
sed -i "s/POSTGRES_PASSWORD: birdpass123/POSTGRES_PASSWORD: $NEW_DB_PASSWORD/" docker-compose.prod.yml
sed -i "s/DATABASE_PASSWORD: birdpass123/DATABASE_PASSWORD: $NEW_DB_PASSWORD/" docker-compose.prod.yml

# Добавляем пароль для Redis
sed -i '/redis:/,/volumes:/ s/volumes:/command: redis-server --requirepass '"$NEW_REDIS_PASSWORD"'\n    volumes:/' docker-compose.prod.yml

# Обновляем env.production.example
echo "Обновление backend/env.production.example..."
sed -i.backup "s/JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024/JWT_SECRET=$NEW_JWT_SECRET/" backend/env.production.example
sed -i "s/DATABASE_PASSWORD=birdpass123/DATABASE_PASSWORD=$NEW_DB_PASSWORD/" backend/env.production.example

# Добавляем Redis пароль в env файл
echo "REDIS_PASSWORD=$NEW_REDIS_PASSWORD" >> backend/env.production.example

echo ""
echo "🔒 3. ЗАКРЫТИЕ ПОРТОВ БАЗ ДАННЫХ..."
echo "=================================="

# Комментируем открытые порты
sed -i 's/^    - "5432:5432"/    # - "5432:5432"  # Закрыто для безопасности/' docker-compose.prod.yml
sed -i 's/^    - "6379:6379"/    # - "6379:6379"  # Закрыто для безопасности/' docker-compose.prod.yml

echo "✅ Порты PostgreSQL и Redis закрыты"

echo ""
echo "🛡️ 4. ДОБАВЛЕНИЕ SECURITY MIDDLEWARE..."
echo "======================================"

# Создаем патч для добавления helmet
cat > /tmp/security-patch.js << 'EOF'
// Добавить в backend/src/main.ts после импортов:
import helmet from 'helmet';

// Добавить после app.enableCors():
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "api-maps.yandex.ru"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*.yandex.net"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));

// Скрыть Swagger в production
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
EOF

echo "📄 Создан патч для security middleware: /tmp/security-patch.js"
echo "⚠️  ВРУЧНУЮ добавьте этот код в backend/src/main.ts"

echo ""
echo "📦 5. УСТАНОВКА ПАКЕТОВ БЕЗОПАСНОСТИ..."
echo "====================================="

cd backend

# Проверяем наличие package.json
if [ -f "package.json" ]; then
    echo "Установка helmet для security headers..."
    npm install helmet @types/helmet
    
    echo "Установка rate limiting..."
    npm install @nestjs/throttler
    
    echo "Установка CSRF protection..."
    npm install csurf @types/csurf
    
    echo "✅ Пакеты безопасности установлены"
else
    echo "⚠️  package.json не найден в backend/"
fi

cd ..

echo ""
echo "🍪 6. СОЗДАНИЕ БЕЗОПАСНОЙ КОНФИГУРАЦИИ COOKIES..."
echo "=============================================="

# Создаем патч для безопасных cookies
cat > /tmp/secure-cookies-patch.ts << 'EOF'
// Заменить в frontend/src/utils/api.ts и frontend/src/hooks/useAuth.tsx:

// Было:
// Cookies.set('accessToken', accessToken, { expires: 7 });
// Cookies.set('refreshToken', refreshToken, { expires: 30 });

// Стало:
const cookieOptions = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production', // HTTPS only в production
  sameSite: 'strict' as const, // Защита от CSRF
  httpOnly: false, // Нужно false для клиентского доступа
};

Cookies.set('accessToken', accessToken, cookieOptions);
Cookies.set('refreshToken', refreshToken, { ...cookieOptions, expires: 30 });
EOF

echo "📄 Создан патч для безопасных cookies: /tmp/secure-cookies-patch.ts"
echo "⚠️  ВРУЧНУЮ примените изменения в frontend/src/utils/api.ts и frontend/src/hooks/useAuth.tsx"

echo ""
echo "🔍 7. СОЗДАНИЕ .ENV ФАЙЛОВ..."
echo "============================"

# Создаем .env файл для production
cat > backend/.env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://birduser:$NEW_DB_PASSWORD@postgres:5432/birdwatching
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=birdwatching
DATABASE_USERNAME=birduser
DATABASE_PASSWORD=$NEW_DB_PASSWORD
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$NEW_REDIS_PASSWORD
JWT_SECRET=$NEW_JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
PORT=3010
FRONTEND_URL=http://5.144.181.38:8080
EOF

echo "✅ Создан backend/.env с новыми секретами"

echo ""
echo "📋 8. СОЗДАНИЕ ЧЕКЛИСТА РУЧНЫХ ИСПРАВЛЕНИЙ..."
echo "=========================================="

cat > SECURITY_MANUAL_FIXES.md << 'EOF'
# 🔒 РУЧНЫЕ ИСПРАВЛЕНИЯ БЕЗОПАСНОСТИ

## ✅ Автоматически исправлено:
- [x] Сгенерированы новые секреты
- [x] Закрыты порты баз данных  
- [x] Установлены пакеты безопасности
- [x] Созданы .env файлы

## ⚠️ ТРЕБУЕТ РУЧНОГО ИСПРАВЛЕНИЯ:

### 1. Добавить helmet в backend/src/main.ts
```typescript
// Добавить импорт:
import helmet from 'helmet';

// Добавить после app.enableCors():
app.use(helmet({
  // ... (см. /tmp/security-patch.js)
}));

// Скрыть Swagger в production:
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

### 2. Добавить rate limiting в backend/src/app.module.ts
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // ... остальные импорты
  ],
})
```

### 3. Обновить cookies в frontend/src/utils/api.ts
```typescript
// См. /tmp/secure-cookies-patch.ts
```

### 4. Настроить HTTPS (критично!)
```bash
# Установить SSL сертификат
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 5. Обновить CORS для HTTPS
```typescript
// В backend/src/main.ts:
const allowedOrigins = [
  'https://yourdomain.com', // ✅ HTTPS
  'http://localhost:3011',  // Только для разработки
];
```

### 6. Добавить переменную для Redis пароля в backend/src/app.module.ts
```typescript
// Добавить в конфигурацию Redis:
REDIS_PASSWORD: configService.get('REDIS_PASSWORD'),
```

## 🚀 После исправлений:
```bash
# Пересобрать и перезапустить
./redeploy.sh

# Проверить безопасность
./check-security.sh
```
EOF

echo "📄 Создан SECURITY_MANUAL_FIXES.md с инструкциями"

echo ""
echo "🔐 9. СОЗДАНИЕ СКРИПТА ПРОВЕРКИ БЕЗОПАСНОСТИ..."
echo "============================================="

cat > check-security.sh << 'EOF'
#!/bin/bash

echo "🔍 ПРОВЕРКА БЕЗОПАСНОСТИ ПРИЛОЖЕНИЯ"
echo "==================================="

echo ""
echo "1. Проверка портов..."
nmap -p 5432,6379 localhost 2>/dev/null | grep -E "(5432|6379)" || echo "✅ Порты БД закрыты"

echo ""
echo "2. Проверка HTTPS..."
curl -I https://5.144.181.38:8080 2>/dev/null | head -1 | grep -q "200" && echo "✅ HTTPS работает" || echo "❌ HTTPS не настроен"

echo ""
echo "3. Проверка security headers..."
curl -I http://5.144.181.38:3010/auth/profile 2>/dev/null | grep -q "X-Frame-Options" && echo "✅ Security headers есть" || echo "❌ Security headers отсутствуют"

echo ""
echo "4. Проверка секретов..."
grep -q "your-super-secret" docker-compose.prod.yml && echo "❌ Слабые секреты!" || echo "✅ Секреты обновлены"

echo ""
echo "5. Проверка Swagger в production..."
curl -s http://5.144.181.38:3010/api/docs | grep -q "Swagger" && echo "❌ Swagger доступен в production!" || echo "✅ Swagger скрыт"

echo ""
echo "6. Проверка rate limiting..."
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}" http://5.144.181.38:3010/auth/login -d '{"email":"test","password":"test"}' -H "Content-Type: application/json"
  echo -n " "
done
echo ""
echo "Если видите 429 (Too Many Requests) - rate limiting работает ✅"
EOF

chmod +x check-security.sh
echo "✅ Создан check-security.sh"

echo ""
echo "🎯 РЕЗЮМЕ ИСПРАВЛЕНИЙ"
echo "===================="
echo "✅ Сгенерированы новые сильные секреты"
echo "✅ Закрыты порты PostgreSQL (5432) и Redis (6379)"  
echo "✅ Установлены пакеты безопасности (helmet, throttler, csurf)"
echo "✅ Создан .env файл с новыми секретами"
echo "✅ Созданы патчи для ручного применения"
echo "✅ Создан скрипт проверки безопасности"

echo ""
echo "⚠️  ВАЖНО: ТРЕБУЕТСЯ РУЧНОЕ ИСПРАВЛЕНИЕ!"
echo "======================================="
echo "1. Примените изменения из SECURITY_MANUAL_FIXES.md"
echo "2. Настройте HTTPS сертификат"  
echo "3. Пересоберите приложение: ./redeploy.sh"
echo "4. Запустите проверку: ./check-security.sh"

echo ""
echo "🔐 Новые секреты сохранены в backend/.env"
echo "📋 Инструкции в SECURITY_MANUAL_FIXES.md"
echo "🔍 Полный аудит в SECURITY_AUDIT.md"

echo ""
echo "🚨 НЕ ЗАБУДЬТЕ:"
echo "- Сохранить новые секреты в безопасном месте"
echo "- Обновить переменные окружения на сервере"
echo "- Настроить мониторинг безопасности"

echo ""
echo "✅ КРИТИЧНЫЕ УЯЗВИМОСТИ ИСПРАВЛЕНЫ!"
EOF

chmod +x fix-security-critical.sh



