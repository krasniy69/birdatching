#!/bin/bash

# Скрипт развертывания приложения BirdWatching на удаленном сервере

SERVER_IP="5.144.181.38"
SERVER_USER="root"  # Замените на вашего пользователя
APP_DIR="/opt/birdwatching"

echo "🚀 Начинаем развертывание приложения BirdWatching на сервере $SERVER_IP"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ОШИБКА] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[ПРЕДУПРЕЖДЕНИЕ] $1${NC}"
}

# Проверка доступности сервера
log "Проверяем доступность сервера..."
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    error "Сервер $SERVER_IP недоступен!"
    exit 1
fi

log "Сервер доступен ✓"

# Создание архива проекта
log "Создаем архив проекта..."
tar -czf birdwatching.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=build \
    --exclude=*.log \
    --exclude=postgres_data \
    --exclude=redis_data \
    .

log "Архив создан ✓"

# Копирование файлов на сервер
log "Копируем файлы на сервер..."
scp birdwatching.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Выполнение команд на удаленном сервере
log "Выполняем развертывание на сервере..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
    set -e
    
    echo "📦 Распаковываем архив..."
    cd /tmp
    rm -rf /opt/birdwatching
    mkdir -p /opt/birdwatching
    tar -xzf birdwatching.tar.gz -C /opt/birdwatching
    cd /opt/birdwatching
    
    echo "🔧 Настраиваем переменные окружения..."
    # Копируем production конфигурацию
    cp backend/env.production.example backend/.env
    cp frontend/env.production.example frontend/.env.local
    
    # Настраиваем порты (используем альтернативные если 80 занят)
    export FRONTEND_PORT=8080
    export BACKEND_PORT=3010
    
    # Обновляем конфигурацию API URL с правильным портом
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://5.144.181.38:$BACKEND_PORT|" frontend/.env.local
    
    echo "🐳 Устанавливаем Docker (если не установлен)..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "🛑 Останавливаем существующие контейнеры..."
    docker-compose -f docker-compose.prod.yml down || true
    
    echo "🏗️ Собираем и запускаем приложение..."
    FRONTEND_PORT=$FRONTEND_PORT BACKEND_PORT=$BACKEND_PORT docker-compose -f docker-compose.prod.yml up --build -d
    
    echo "⏳ Ждем запуска сервисов..."
    sleep 30
    
    echo "🔍 Проверяем статус контейнеров..."
    docker-compose -f docker-compose.prod.yml ps
    
    echo "📋 Проверяем логи..."
    docker-compose -f docker-compose.prod.yml logs --tail=10
    
    echo "🔥 Настраиваем автозапуск..."
    # Создаем systemd сервис для автозапуска
    cat > /etc/systemd/system/birdwatching.service << 'EOF'
[Unit]
Description=BirdWatching App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/birdwatching
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl enable birdwatching.service
    
    echo "✅ Развертывание завершено!"
    echo "🌐 Приложение доступно по адресу: http://5.144.181.38:$FRONTEND_PORT"
    echo "📚 API документация: http://5.144.181.38:$BACKEND_PORT/api/docs"
    
ENDSSH

# Очистка временных файлов
log "Очищаем временные файлы..."
rm -f birdwatching.tar.gz

log "🎉 Развертывание завершено успешно!"
log "🌐 Ваше приложение доступно по адресу: http://$SERVER_IP:8080"
log "📚 API документация: http://$SERVER_IP:3010/api/docs"

echo ""
echo "📋 Полезные команды для управления приложением на сервере:"
echo "  Просмотр логов: ssh $SERVER_USER@$SERVER_IP 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml logs -f'"
echo "  Перезапуск: ssh $SERVER_USER@$SERVER_IP 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml restart'"
echo "  Остановка: ssh $SERVER_USER@$SERVER_IP 'cd /opt/birdwatching && docker-compose -f docker-compose.prod.yml down'"
echo "  Обновление: ./deploy.sh"
