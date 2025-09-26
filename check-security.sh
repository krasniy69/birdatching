#!/bin/bash

echo "🔍 ПРОВЕРКА БЕЗОПАСНОСТИ ПРИЛОЖЕНИЯ BIRDWATCHING"
echo "==============================================="

echo ""
echo "1. 🔐 Проверка секретов..."
if grep -q "your-super-secret" docker-compose.prod.yml; then
    echo "❌ Обнаружены слабые секреты в docker-compose.prod.yml!"
else
    echo "✅ Секреты обновлены в docker-compose.prod.yml"
fi

if grep -q "your-super-secret" backend/env.production.example; then
    echo "❌ Обнаружены слабые секреты в env.production.example!"
else
    echo "✅ Секреты обновлены в env.production.example"
fi

echo ""
echo "2. 🔒 Проверка портов баз данных..."
if grep -q '^    - "5432:5432"' docker-compose.prod.yml; then
    echo "❌ Порт PostgreSQL (5432) открыт!"
else
    echo "✅ Порт PostgreSQL закрыт"
fi

if grep -q '^    - "6379:6379"' docker-compose.prod.yml; then
    echo "❌ Порт Redis (6379) открыт!"
else
    echo "✅ Порт Redis закрыт"
fi

echo ""
echo "3. 🛡️ Проверка security middleware..."
if grep -q "import helmet from 'helmet'" backend/src/main.ts; then
    echo "✅ Helmet импортирован"
else
    echo "❌ Helmet не импортирован"
fi

if grep -q "app.use(helmet" backend/src/main.ts; then
    echo "✅ Helmet настроен"
else
    echo "❌ Helmet не настроен"
fi

if grep -q "ThrottlerModule" backend/src/app.module.ts; then
    echo "✅ Rate limiting настроен"
else
    echo "❌ Rate limiting не настроен"
fi

echo ""
echo "4. 📄 Проверка Swagger в production..."
if grep -q "process.env.NODE_ENV !== 'production'" backend/src/main.ts; then
    echo "✅ Swagger скрыт в production"
else
    echo "❌ Swagger доступен в production"
fi

echo ""
echo "5. 🍪 Проверка безопасных cookies..."
if grep -q "getCookieOptions" frontend/src/utils/api.ts; then
    echo "✅ Безопасные cookies в api.ts"
else
    echo "❌ Небезопасные cookies в api.ts"
fi

if grep -q "getCookieOptions" frontend/src/hooks/useAuth.tsx; then
    echo "✅ Безопасные cookies в useAuth.tsx"
else
    echo "❌ Небезопасные cookies в useAuth.tsx"
fi

echo ""
echo "6. 📦 Проверка пакетов безопасности..."
if [ -f "backend/package.json" ]; then
    if grep -q '"helmet"' backend/package.json; then
        echo "✅ Helmet установлен"
    else
        echo "❌ Helmet не установлен"
    fi
    
    if grep -q '"@nestjs/throttler"' backend/package.json; then
        echo "✅ Throttler установлен"
    else
        echo "❌ Throttler не установлен"
    fi
else
    echo "⚠️  package.json не найден"
fi

echo ""
echo "7. 🌐 Проверка приложения на сервере (если запущено)..."
if command -v curl &> /dev/null; then
    echo "Проверка фронтенда..."
    if curl -s -o /dev/null -w "%{http_code}" http://5.144.181.38:8080 | grep -q "200"; then
        echo "✅ Фронтенд доступен (200)"
    else
        echo "❌ Фронтенд недоступен"
    fi
    
    echo "Проверка API..."
    if curl -s -o /dev/null -w "%{http_code}" http://5.144.181.38:3010/auth/profile | grep -q "401"; then
        echo "✅ API работает (401 без токена - нормально)"
    else
        echo "❌ API недоступен или проблемы"
    fi
    
    echo "Проверка Swagger..."
    SWAGGER_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://5.144.181.38:3010/api/docs)
    if [ "$SWAGGER_CODE" = "404" ]; then
        echo "✅ Swagger скрыт в production (404)"
    elif [ "$SWAGGER_CODE" = "200" ]; then
        echo "❌ Swagger доступен в production!"
    else
        echo "⚠️  Swagger: HTTP $SWAGGER_CODE"
    fi
    
    echo "Проверка security headers..."
    HEADERS=$(curl -s -I http://5.144.181.38:3010/auth/profile)
    if echo "$HEADERS" | grep -q "X-Frame-Options"; then
        echo "✅ Security headers присутствуют"
    else
        echo "❌ Security headers отсутствуют"
    fi
    
    echo "Проверка rate limiting (10 быстрых запросов)..."
    for i in {1..12}; do
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://5.144.181.38:3010/auth/login \
               -H "Content-Type: application/json" \
               -d '{"email":"test","password":"test"}')
        echo -n "$CODE "
        if [ "$CODE" = "429" ]; then
            echo ""
            echo "✅ Rate limiting работает (429 Too Many Requests)"
            break
        fi
        sleep 0.1
    done
    echo ""
else
    echo "⚠️  curl не установлен, пропускаем проверку сервера"
fi

echo ""
echo "📊 РЕЗЮМЕ ПРОВЕРКИ БЕЗОПАСНОСТИ"
echo "==============================="
echo "✅ - Исправлено"
echo "❌ - Требует внимания" 
echo "⚠️  - Предупреждение"
echo ""
echo "🔐 Следующие шаги:"
echo "1. Исправить все ❌ проблемы"
echo "2. Настроить HTTPS сертификат"
echo "3. Пересобрать приложение: ./redeploy.sh"
echo "4. Повторить проверку"
echo ""
echo "📋 Полный аудит безопасности: SECURITY_AUDIT.md"



