# 🔧 Исправление ошибки подписок на категории

**Дата:** 28 сентября 2025  
**Проблема:** Ошибка 500 при подписке пользователем на категорию  
**Статус:** ✅ РЕШЕНА

## 🐛 Описание проблемы

При попытке пользователя подписаться на категорию возникала ошибка:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

## 🔍 Диагностика

### Логи бэкенда показали:
```
QueryFailedError: null value in column "userId" of relation "subscriptions" violates not-null constraint
```

### Причина:
В контроллере подписок использовалось неправильное поле для получения `userId` из JWT токена.

## ✅ Решение

### Проблема в JWT стратегии
**Файл:** `backend/src/auth/strategies/jwt.strategy.ts`

JWT стратегия возвращает объект пользователя в следующем формате:
```typescript
return {
  userId: user.id,    // ← Поле называется userId
  email: user.email,
  role: user.role,
};
```

### Ошибка в контроллере подписок
**Файл:** `backend/src/subscriptions/subscriptions.controller.ts`

Контроллер использовал неправильное поле:
```typescript
// ❌ Неправильно
return this.subscriptionsService.subscribe(req.user.id, createSubscriptionDto);

// ✅ Правильно  
return this.subscriptionsService.subscribe(req.user.userId, createSubscriptionDto);
```

### Исправления

Обновлены все методы контроллера подписок:

```typescript
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  subscribe(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(req.user.userId, createSubscriptionDto);
  }

  @Delete(':categoryId')
  unsubscribe(@Request() req, @Param('categoryId', ParseUUIDPipe) categoryId: string) {
    return this.subscriptionsService.unsubscribe(req.user.userId, categoryId);
  }

  @Get('my')
  getUserSubscriptions(@Request() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.userId);
  }

  @Get('my-with-categories')
  getUserSubscriptionsWithCategories(@Request() req) {
    return this.subscriptionsService.getUserSubscriptionsWithCategories(req.user.userId);
  }
}
```

## 🧪 Тестирование

### ✅ API тесты

1. **Подписка на категорию:**
```bash
curl -X POST http://localhost:3010/subscriptions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryId": "category-uuid"}'
```

**Результат:** ✅ Подписка создана успешно
```json
{
  "userId": "238d1fc0-0174-4420-b958-c2a3e56529cd",
  "categoryId": "4f5824fb-b62b-43e1-894b-7a7a459cf02a",
  "id": "7675d509-0828-4423-aef7-faa210346356",
  "createdAt": "2025-09-27T23:13:52.006Z"
}
```

2. **Получение подписок с категориями:**
```bash
curl -X GET http://localhost:3010/subscriptions/my-with-categories \
  -H "Authorization: Bearer TOKEN"
```

**Результат:** ✅ Возвращает подписки и статус подписки для каждой категории
```json
{
  "subscriptions": [
    {
      "id": "7675d509-0828-4423-aef7-faa210346356",
      "userId": "238d1fc0-0174-4420-b958-c2a3e56529cd",
      "categoryId": "4f5824fb-b62b-43e1-894b-7a7a459cf02a",
      "createdAt": "2025-09-27T23:13:52.006Z",
      "category": {
        "id": "4f5824fb-b62b-43e1-894b-7a7a459cf02a",
        "name": "Птицы леса",
        "description": "Экскурсии по лесным массивам для наблюдения за лесными птицами",
        "color": "#10B981",
        "icon": "tree"
      }
    }
  ],
  "categories": [
    {
      "id": "4f5824fb-b62b-43e1-894b-7a7a459cf02a",
      "name": "Птицы леса",
      "description": "Экскурсии по лесным массивам для наблюдения за лесными птицами",
      "color": "#10B981",
      "icon": "tree",
      "isSubscribed": true
    },
    {
      "id": "29f12dbc-ded3-4443-b533-9c3ffb46291a",
      "name": "Водоплавающие",
      "description": "Наблюдение за водоплавающими птицами у водоемов",
      "color": "#3B82F6",
      "icon": "water",
      "isSubscribed": false
    }
  ]
}
```

3. **Отписка от категории:**
```bash
curl -X DELETE http://localhost:3010/subscriptions/category-uuid \
  -H "Authorization: Bearer TOKEN"
```

**Результат:** ✅ Подписка удалена успешно

### ✅ Frontend тесты

1. **Страница категорий:** http://localhost:3011/categories
   - ✅ Загружается без ошибок
   - ✅ Отображает все категории
   - ✅ Показывает статус подписки
   - ✅ Позволяет подписываться/отписываться

## 📚 Уроки

1. **Консистентность в JWT стратегии** - важно использовать единообразные имена полей
2. **Отладка JWT токенов** - добавление логирования помогает быстро найти проблемы
3. **Валидация полей** - TypeScript помогает, но не защищает от ошибок в runtime

## 🔧 Отладочные инструменты

Для диагностики подобных проблем полезно:

1. **Логирование в контроллерах:**
```typescript
console.log('User from request:', req.user);
```

2. **Проверка JWT стратегии:**
```typescript
// В jwt.strategy.ts
async validate(payload: JwtPayload) {
  const user = await this.usersService.findById(payload.sub);
  if (!user) {
    throw new UnauthorizedException();
  }
  
  const result = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  console.log('JWT validate result:', result); // Отладка
  return result;
}
```

## 🚀 Статус

**Проблема полностью решена!**

- ✅ API подписок работает корректно
- ✅ Подписка на категории функционирует
- ✅ Отписка от категорий работает
- ✅ Получение подписок с категориями работает
- ✅ Frontend может взаимодействовать с API

Все функции подписок на категории теперь работают без ошибок! 🎉
