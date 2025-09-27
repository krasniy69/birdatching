#!/bin/bash

# Скрипт для проверки состояния приложения на удаленном сервере

SERVER_IP="5.144.181.38"
SERVER_USER="root"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Проверяем состояние приложения BirdWatching на сервере $SERVER_IP${NC}"
echo ""

# Проверка доступности сервера
echo -n "📡 Проверка доступности сервера... "
if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Доступен${NC}"
else
    echo -e "${RED}✗ Недоступен${NC}"
    exit 1
fi

# Проверка портов
echo "🔌 Проверка портов:"

check_port() {
    local port=$1
    local service=$2
    echo -n "  • Порт $port ($service)... "
    if nc -z $SERVER_IP $port 2>/dev/null; then
        echo -e "${GREEN}✓ Открыт${NC}"
    else
        echo -e "${RED}✗ Закрыт${NC}"
    fi
}

check_port 80 "Web Server (может быть занят)"
check_port 8080 "Frontend (наше приложение)"
check_port 3010 "API Backend"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

echo ""

# Проверка HTTP ответов
echo "🌐 Проверка HTTP ответов:"

check_http() {
    local url=$1
    local service=$2
    echo -n "  • $service ($url)... "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
    
    if [[ $response == "200" ]]; then
        echo -e "${GREEN}✓ 200 OK${NC}"
    elif [[ $response == "401" ]]; then
        echo -e "${YELLOW}⚠ 401 (требует авторизации)${NC}"
    elif [[ $response == "" ]]; then
        echo -e "${RED}✗ Нет ответа${NC}"
    else
        echo -e "${YELLOW}⚠ HTTP $response${NC}"
    fi
}

check_http "http://$SERVER_IP" "Web Server (порт 80)"
check_http "http://$SERVER_IP:8080" "Frontend (наше приложение)"
check_http "http://$SERVER_IP:3010" "API Root"
check_http "http://$SERVER_IP:3010/api/docs" "API Docs"
check_http "http://$SERVER_IP:3010/auth/health" "Health Check"

echo ""

# Проверка контейнеров на сервере (если есть SSH доступ)
echo "🐳 Проверка контейнеров на сервере:"
if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    ssh $SERVER_USER@$SERVER_IP 'cd /opt/birdwatching 2>/dev/null && docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "  Приложение не развернуто или недоступно"'
else
    echo -e "${YELLOW}  ⚠ SSH доступ недоступен или не настроен${NC}"
fi

echo ""
echo -e "${BLUE}📋 Полезные ссылки:${NC}"
echo "  🌐 Приложение: http://$SERVER_IP:8080"
echo "  📚 API Docs: http://$SERVER_IP:3010/api/docs"
echo "  🔐 Тестовые аккаунты:"
echo "    • Админ: admin@birdwatch.ru / admin123"
echo "    • Гид: guide@birdwatch.ru / guide123"
echo "    • Пользователь: user@birdwatch.ru / user123"
