import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import YandexMap from './YandexMap';

interface MeetingPointSelectorProps {
  excursionId: string;
  excursionTitle: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentMeetingPoint?: string;
  currentMeetingLatitude?: number;
  currentMeetingLongitude?: number;
  onSave: (meetingPoint: string, latitude: number, longitude: number) => Promise<void>;
  onClose: () => void;
}

const MeetingPointSelector: React.FC<MeetingPointSelectorProps> = ({
  excursionId,
  excursionTitle,
  currentLatitude,
  currentLongitude,
  currentMeetingPoint,
  currentMeetingLatitude,
  currentMeetingLongitude,
  onSave,
  onClose,
}) => {
  const [meetingPoint, setMeetingPoint] = useState(currentMeetingPoint || '');
  const [meetingLatitude, setMeetingLatitude] = useState<number | undefined>(currentMeetingLatitude);
  const [meetingLongitude, setMeetingLongitude] = useState<number | undefined>(currentMeetingLongitude);
  const [isLoading, setIsLoading] = useState(false);

  const handleMeetingSelect = (latitude: number, longitude: number) => {
    setMeetingLatitude(latitude);
    setMeetingLongitude(longitude);
  };

  const handleSave = async () => {
    if (!meetingPoint.trim()) {
      alert('Пожалуйста, укажите описание места встречи');
      return;
    }

    if (!meetingLatitude || !meetingLongitude) {
      alert('Пожалуйста, выберите точку встречи на карте');
      return;
    }

    try {
      setIsLoading(true);
      await onSave(meetingPoint.trim(), meetingLatitude, meetingLongitude);
      onClose();
    } catch (error) {
      console.error('Error saving meeting point:', error);
      alert('Ошибка при сохранении точки встречи');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExcursionLocation = () => {
    if (currentLatitude && currentLongitude) {
      setMeetingLatitude(currentLatitude);
      setMeetingLongitude(currentLongitude);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Укажите место встречи</span>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Экскурсия: <strong>{excursionTitle}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Описание места встречи */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание места встречи *
            </label>
            <textarea
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="Например: У главного входа в парк, возле информационного стенда"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Укажите подробное описание, чтобы участники легко нашли место встречи
            </p>
          </div>

          {/* Быстрые действия */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUseExcursionLocation}
              disabled={!currentLatitude || !currentLongitude}
            >
              📍 Использовать место экскурсии
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMeetingLatitude(55.7558);
                setMeetingLongitude(37.6173);
              }}
            >
              🏛️ Центр Москвы
            </Button>
          </div>

          {/* Карта */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите точку на карте *
            </label>
            <YandexMap
              latitude={currentLatitude}
              longitude={currentLongitude}
              meetingLatitude={meetingLatitude}
              meetingLongitude={meetingLongitude}
              onMeetingSelect={handleMeetingSelect}
              editable={true}
              showMeetingPoint={true}
              height="350px"
              zoom={12}
            />
            {meetingLatitude && meetingLongitude && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <strong>Выбранные координаты:</strong> {Number(meetingLatitude).toFixed(6)}, {Number(meetingLongitude).toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Советы */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Советы по выбору места встречи
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Выбирайте легко узнаваемые места (памятники, входы, информационные стенды)</li>
              <li>• Учитывайте доступность общественного транспорта</li>
              <li>• Проверьте наличие парковки для автомобилистов</li>
              <li>• Убедитесь, что место подходит для сбора группы</li>
            </ul>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading || !meetingPoint.trim() || !meetingLatitude || !meetingLongitude}
              className="flex-1"
            >
              {isLoading ? 'Сохранение...' : '💾 Сохранить место встречи'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingPointSelector;
