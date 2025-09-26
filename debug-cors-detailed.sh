#!/bin/bash

# Детальная диагностика CORS проблемы

SERVER_IP="5.144.181.38"

echo "🔍 ДЕТАЛЬНАЯ ДИАГНОСТИКА CORS ПРОБЛЕМЫ"
echo "======================================="

echo ""
echo "1. 🧪 Тестируем OPTIONS запрос (preflight):"
echo "-------------------------------------------"
curl -X OPTIONS http://5.144.181.38:3010/auth/login \
  -H "Origin: http://5.144.181.38:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | head -20

echo ""
echo "2. 🧪 Тестируем POST запрос с CORS заголовками:"
echo "-----------------------------------------------"
curl -X POST http://5.144.181.38:3010/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://5.144.181.38:8080" \
  -d '{"email":"admin@birdwatch.ru","password":"admin123"}' \
  -v 2>&1 | head -15

echo ""
echo "3. 🔍 Проверяем, что возвращает сервер на корневой путь:"
echo "--------------------------------------------------------"
curl -X GET http://5.144.181.38:3010/ \
  -H "Origin: http://5.144.181.38:8080" \
  -v 2>&1 | head -10

echo ""
echo "4. 🌐 Проверяем доступность фронтенда:"
echo "--------------------------------------"
curl -I http://5.144.181.38:8080 2>&1 | head -5

echo ""
echo "5. 📋 Смотрим текущие логи бэкенда:"
echo "-----------------------------------"
ssh root@5.144.181.38 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml logs backend --tail=15' 2>/dev/null || echo "Не удалось подключиться по SSH"

echo ""
echo "6. 🔧 Проверяем переменные окружения в контейнере бэкенда:"
echo "----------------------------------------------------------"
ssh root@5.144.181.38 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml exec backend printenv | grep -E "(CORS|FRONTEND|NODE_ENV)"' 2>/dev/null || echo "Не удалось подключиться по SSH"

echo ""
echo "========================================="
echo "💡 РЕКОМЕНДАЦИИ ДЛЯ ДАЛЬНЕЙШЕЙ ОТЛАДКИ:"
echo "========================================="
echo "1. Откройте DevTools в браузере (F12)"
echo "2. Перейдите на вкладку Network"
echo "3. Очистите логи (Clear)"
echo "4. Попробуйте войти в систему"
echo "5. Посмотрите на запросы к /auth/login"
echo "6. Проверьте:"
echo "   - Есть ли OPTIONS запрос перед POST?"
echo "   - Какие заголовки в ответе OPTIONS?"
echo "   - Какая ошибка в POST запросе?"
echo ""
echo "🔗 Ссылки для тестирования:"
echo "  Фронтенд: http://5.144.181.38:8080"
echo "  API Docs: http://5.144.181.38:3010/api/docs"



