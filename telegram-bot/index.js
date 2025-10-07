const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 BirdWatch Telegram Bot запущен...');

// Store pending link requests
const pendingLinks = new Map();

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🦅 Добро пожаловать в BirdWatch Bot!

Этот бот поможет вам:
• Привязать ваш Telegram аккаунт к профилю в приложении
• Получать уведомления об экскурсиях
• Управлять записями на экскурсии

Для начала работы используйте команды:
/link - Привязать аккаунт
/help - Справка
  `;

  bot.sendMessage(chatId, welcomeMessage);
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 Справка по командам:

/link - Привязать ваш Telegram аккаунт к профилю в приложении
/status - Проверить статус привязки
/help - Показать эту справку

🔗 Для привязки аккаунта:
1. Войдите в приложение BirdWatch
2. Перейдите в личный кабинет
3. Нажмите "Привязать Telegram"
4. Введите ваш Telegram ID: ${msg.from.id}
5. Получите код и введите его здесь командой /link <код>
  `;

  bot.sendMessage(chatId, helpMessage);
});

// Link command
bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match[1].trim().toUpperCase();
  const telegramId = msg.from.id.toString();

  console.log(`Попытка привязки: код=${code}, telegramId=${telegramId}`);

  try {
    // Проверяем код через публичный endpoint
    const verifyResponse = await apiRequest('/telegram/public/verify-code', 'POST', {
      code: code,
      telegramId: telegramId
    });

    console.log('Ответ от API:', verifyResponse);

    if (verifyResponse.valid && verifyResponse.success) {
      bot.sendMessage(chatId, `
✅ Отлично! Ваш Telegram аккаунт успешно привязан!

Теперь вы будете получать уведомления:
• О подтверждении записи на экскурсию
• О переходе из резерва в основную группу
• Об отмене экскурсий
• О других важных событиях

Спасибо за использование BirdWatch! 🦅
      `);
    } else {
      bot.sendMessage(chatId, `❌ ${verifyResponse.message || 'Ошибка при привязке аккаунта'}`);
    }
  } catch (error) {
    console.error('Link error:', error);
    console.error('Error details:', error.response?.data || error.message);
    bot.sendMessage(chatId, '❌ Произошла ошибка при привязке. Попробуйте позже или обратитесь в поддержку.');
  }
});

// Status command
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const statusResponse = await apiRequest('/telegram/status', 'GET');
    
    if (statusResponse.isLinked) {
      bot.sendMessage(chatId, `
✅ Ваш аккаунт привязан!

Telegram ID: ${statusResponse.telegramId}
Статус: Привязан

Вы получаете уведомления об экскурсиях.
      `);
    } else {
      bot.sendMessage(chatId, `
❌ Аккаунт не привязан

Для привязки:
1. Войдите в приложение BirdWatch
2. Перейдите в личный кабинет
3. Нажмите "Привязать Telegram"
4. Введите ваш Telegram ID: ${telegramId}
5. Получите код и введите его здесь командой /link <код>
      `);
    }
  } catch (error) {
    console.error('Status error:', error);
    bot.sendMessage(chatId, '❌ Не удалось проверить статус. Попробуйте позже.');
  }
});

// Handle any other text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // Ignore commands
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }

  bot.sendMessage(chatId, `
🤔 Не понимаю эту команду.

Используйте /help для просмотра доступных команд.
  `);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Bot готов к работе!');
