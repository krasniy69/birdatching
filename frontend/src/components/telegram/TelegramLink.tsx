import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTelegram } from '@/hooks/useTelegram';

interface TelegramLinkProps {
  onStatusChange?: (isLinked: boolean) => void;
}

const TelegramLink: React.FC<TelegramLinkProps> = ({ onStatusChange }) => {
  const { isLoading, error, getStatus, generateCode, linkAccount, unlinkAccount } = useTelegram();
  const [status, setStatus] = useState<{ isLinked: boolean; telegramId?: string } | null>(null);
  const [telegramId, setTelegramId] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'generate' | 'link'>('idle');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const statusData = await getStatus();
      setStatus(statusData);
      onStatusChange?.(statusData.isLinked);
    } catch (err) {
      console.error('Ошибка загрузки статуса:', err);
    }
  };

  const handleGenerateCode = async () => {
    if (!telegramId.trim()) {
      alert('Введите Telegram ID');
      return;
    }

    try {
      const code = await generateCode(telegramId);
      setGeneratedCode(code);
      setStep('link');
    } catch (err) {
      console.error('Ошибка генерации кода:', err);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkCode.trim()) {
      alert('Введите код привязки');
      return;
    }

    try {
      await linkAccount(linkCode);
      setStep('idle');
      setTelegramId('');
      setLinkCode('');
      setGeneratedCode(null);
      await loadStatus();
    } catch (err) {
      console.error('Ошибка привязки:', err);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Вы уверены, что хотите отвязать Telegram аккаунт?')) {
      return;
    }

    try {
      await unlinkAccount();
      await loadStatus();
    } catch (err) {
      console.error('Ошибка отвязки:', err);
    }
  };

  if (status?.isLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Telegram
            <span className="text-green-600 text-sm">✓ Привязан</span>
          </CardTitle>
          <CardDescription>
            Ваш Telegram аккаунт привязан к профилю
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Telegram ID:</Label>
              <p className="text-sm text-gray-600 font-mono">{status.telegramId}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleUnlink}
              disabled={isLoading}
            >
              {isLoading ? 'Отвязка...' : 'Отвязать аккаунт'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Telegram
          <span className="text-gray-500 text-sm">Не привязан</span>
        </CardTitle>
        <CardDescription>
          Привяжите Telegram для получения уведомлений об экскурсиях
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {step === 'idle' && (
            <>
              <div>
                <Label htmlFor="telegramId">Ваш Telegram ID</Label>
                <Input
                  id="telegramId"
                  type="text"
                  placeholder="@username или числовой ID"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Узнать свой ID можно у бота @userinfobot
                </p>
              </div>
              <Button 
                onClick={() => setStep('generate')}
                disabled={!telegramId.trim() || isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Начать привязку'}
              </Button>
            </>
          )}

          {step === 'generate' && (
            <>
              <div>
                <Label>Telegram ID: {telegramId}</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Нажмите кнопку ниже, чтобы получить код привязки
                </p>
              </div>
              <Button 
                onClick={handleGenerateCode}
                disabled={isLoading}
              >
                {isLoading ? 'Генерация кода...' : 'Получить код'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStep('idle')}
                className="ml-2"
              >
                Назад
              </Button>
            </>
          )}

          {step === 'link' && generatedCode && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label>Код привязки:</Label>
                <div className="text-2xl font-mono font-bold text-blue-600 my-2">
                  {generatedCode}
                </div>
                <p className="text-sm text-gray-600">
                  Введите этот код в Telegram боте @birdwatch_bot командой /link
                </p>
              </div>
              
              <div>
                <Label htmlFor="linkCode">Код из бота</Label>
                <Input
                  id="linkCode"
                  type="text"
                  placeholder="Введите код из бота"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleLinkAccount}
                  disabled={!linkCode.trim() || isLoading}
                >
                  {isLoading ? 'Привязка...' : 'Привязать аккаунт'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('generate')}
                >
                  Новый код
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramLink;
