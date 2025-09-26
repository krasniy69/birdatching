import React, { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  latitude?: number;
  longitude?: number;
  meetingLatitude?: number;
  meetingLongitude?: number;
  onLocationSelect?: (latitude: number, longitude: number) => void;
  onMeetingSelect?: (latitude: number, longitude: number) => void;
  editable?: boolean;
  height?: string;
  zoom?: number;
  showMeetingPoint?: boolean;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap: React.FC<YandexMapProps> = ({
  latitude = 55.7558,
  longitude = 37.6173,
  meetingLatitude,
  meetingLongitude,
  onLocationSelect,
  onMeetingSelect,
  editable = false,
  height = '400px',
  zoom = 10,
  showMeetingPoint = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [locationPlacemark, setLocationPlacemark] = useState<any>(null);
  const [meetingPlacemark, setMeetingPlacemark] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || !window.ymaps || !isMounted) return;

      try {
        // Очищаем предыдущую карту
        if (map) {
          map.destroy();
          setMap(null);
          setLocationPlacemark(null);
          setMeetingPlacemark(null);
        }

        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: [latitude, longitude],
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl'],
        });

        if (!isMounted) {
          mapInstance.destroy();
          return;
        }

        setMap(mapInstance);

        // Добавляем основную метку локации
        if (latitude && longitude) {
          const placemark = new window.ymaps.Placemark(
            [latitude, longitude],
            {
              balloonContent: 'Место проведения экскурсии',
              hintContent: 'Локация экскурсии',
            },
            {
              preset: 'islands#redDotIcon',
              draggable: editable,
            }
          );

          if (editable && onLocationSelect) {
            placemark.events.add('dragend', (e: any) => {
              const coords = e.get('target').geometry.getCoordinates();
              onLocationSelect(coords[0], coords[1]);
            });
          }

          mapInstance.geoObjects.add(placemark);
          setLocationPlacemark(placemark);
        }

        // Добавляем метку места встречи
        if (showMeetingPoint && meetingLatitude && meetingLongitude) {
          const meetingMark = new window.ymaps.Placemark(
            [meetingLatitude, meetingLongitude],
            {
              balloonContent: 'Место встречи',
              hintContent: 'Точка встречи участников',
            },
            {
              preset: 'islands#blueDotIcon',
              draggable: editable,
            }
          );

          if (editable && onMeetingSelect) {
            meetingMark.events.add('dragend', (e: any) => {
              const coords = e.get('target').geometry.getCoordinates();
              onMeetingSelect(coords[0], coords[1]);
            });
          }

          mapInstance.geoObjects.add(meetingMark);
          setMeetingPlacemark(meetingMark);
        }

        // Обработчик клика по карте для выбора локации
        if (editable && onLocationSelect) {
          mapInstance.events.add('click', (e: any) => {
            const coords = e.get('coords');
            onLocationSelect(coords[0], coords[1]);
            
            // Обновляем или создаем метку
            if (locationPlacemark) {
              locationPlacemark.geometry.setCoordinates(coords);
            } else {
              const newPlacemark = new window.ymaps.Placemark(
                coords,
                {
                  balloonContent: 'Место проведения экскурсии',
                  hintContent: 'Локация экскурсии',
                },
                {
                  preset: 'islands#redDotIcon',
                  draggable: true,
                }
              );
              
              newPlacemark.events.add('dragend', (dragEvent: any) => {
                const dragCoords = dragEvent.get('target').geometry.getCoordinates();
                onLocationSelect(dragCoords[0], dragCoords[1]);
              });

              mapInstance.geoObjects.add(newPlacemark);
              setLocationPlacemark(newPlacemark);
            }
          });
        }

        setIsLoading(false);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError('Ошибка при инициализации карты');
          setIsLoading(false);
        }
      }
    };

    const loadYandexMaps = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => {
          if (isMounted) initMap();
        });
        return;
      }

      // Проверяем, не загружается ли уже скрипт
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        const handleLoad = () => {
          if (window.ymaps && isMounted) {
            window.ymaps.ready(() => {
              if (isMounted) initMap();
            });
          }
        };

        if (window.ymaps) {
          handleLoad();
        } else {
          existingScript.addEventListener('load', handleLoad);
        }
        return;
      }

      // Загружаем API Яндекс.Карт
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.onload = () => {
        if (window.ymaps && isMounted) {
          window.ymaps.ready(() => {
            if (isMounted) initMap();
          });
        }
      };
      script.onerror = () => {
        if (isMounted) {
          setError('Не удалось загрузить Яндекс.Карты');
          setIsLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();

    return () => {
      isMounted = false;
      if (map) {
        map.destroy();
      }
    };
  }, []); // Убираем зависимости, чтобы избежать пересоздания карты

  // Отдельный эффект для обновления позиции меток
  useEffect(() => {
    if (map && locationPlacemark && latitude && longitude && isInitialized) {
      locationPlacemark.geometry.setCoordinates([latitude, longitude]);
      map.setCenter([latitude, longitude]);
    }
  }, [map, locationPlacemark, latitude, longitude, isInitialized]);

  useEffect(() => {
    if (map && meetingPlacemark && meetingLatitude && meetingLongitude && isInitialized) {
      meetingPlacemark.geometry.setCoordinates([meetingLatitude, meetingLongitude]);
    }
  }, [map, meetingPlacemark, meetingLatitude, meetingLongitude, isInitialized]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-2">❌ {error}</p>
          <p className="text-sm text-gray-500">
            Проверьте подключение к интернету
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border"
      />
      
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {editable && !isLoading && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Место экскурсии</span>
            </div>
            {showMeetingPoint && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Место встречи</span>
              </div>
            )}
          </div>
          <p className="mt-1">
            {onLocationSelect ? 'Кликните по карте или перетащите метку для выбора координат' : 'Просмотр локации'}
          </p>
        </div>
      )}
    </div>
  );
};

export default YandexMap;