# Инструкции для ручного исправления на сервере

## Подключение к серверу
```bash
ssh root@5.144.181.38
# Пароль: 7TdYGUmsPt3ao1
```

## Шаги исправления

### 1. Перейти в директорию проекта
```bash
cd /root/Birdwatching
```

### 2. Остановить контейнеры
```bash
docker-compose -f docker-compose.prod.yml down
```

### 3. Обновить nginx.conf
Скопируйте содержимое файла nginx.conf из локальной версии в `/etc/nginx/sites-available/excursionapp`:

```bash
# Создайте резервную копию
cp /etc/nginx/sites-available/excursionapp /etc/nginx/sites-available/excursionapp.backup

# Отредактируйте файл
nano /etc/nginx/sites-available/excursionapp
```

### 4. Проверить конфигурацию nginx
```bash
nginx -t
```

### 5. Перезапустить nginx
```bash
systemctl restart nginx
```

### 6. Пересобрать фронтенд
```bash
docker-compose -f docker-compose.prod.yml build --no-cache frontend
```

### 7. Запустить контейнеры
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 8. Проверить статус
```bash
docker ps
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

### 9. Проверить API
```bash
curl -I https://excursionapp.mywire.org/auth/login
```

## Содержимое обновленного nginx.conf

Скопируйте это содержимое в `/etc/nginx/sites-available/excursionapp`:

```nginx
server {
    listen 80;
    server_name excursionapp.mywire.org 5.144.181.38;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name excursionapp.mywire.org 5.144.181.38;

    # SSL Configuration (будет добавлено Certbot)
    # ssl_certificate /etc/letsencrypt/live/excursionapp.mywire.org/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/excursionapp.mywire.org/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' api-maps.yandex.ru; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.yandex.net; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';";

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth endpoints
    location /auth {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers для API
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Other backend endpoints
    location ~ ^/(excursions|bookings|users) {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers для API
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Static files optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

## Проверка результата

После выполнения всех шагов:

1. Откройте https://excursionapp.mywire.org/auth/login
2. Попробуйте авторизоваться
3. Проверьте Network tab в DevTools - не должно быть CORS ошибок
4. API должен отвечать на https://excursionapp.mywire.org/auth/login

