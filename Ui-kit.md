✅ UI Kit (Дизайн-гайд для компонентов)
1. Цветовая палитра
Основной цвет (Primary): #34A853 (зеленый, акцент для кнопок и активных элементов)
Вторичный цвет (Secondary): #F5F5F5 (фон карточек и форм)
Текст:
Основной текст: #1A1A1A
Подписи и второстепенный текст: #6B7280
Фон страницы: #FFFFFF
2. Типографика
Шрифт: Inter или Roboto, sans-serif
Размеры:
Заголовки: text-xl (h1), text-lg (h2)
Основной текст: text-base
Подписи: text-sm
Вес:
Заголовки: font-semibold
Текст: font-normal
3. Компоненты UI
3.1. Кнопки
Primary Button:
<button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
  Кнопка
</button>
Secondary Button:
<button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
  Кнопка
</button>
3.2. Поля ввода
Input:
<input type="text" class="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Введите текст" />
3.3. Формы
Login Form (пример):
<div class="flex flex-col gap-4 w-80 mx-auto">
  <input type="email" placeholder="Email" class="border border-gray-300 rounded-lg px-3 py-2 w-full" />
  <input type="password" placeholder="Пароль" class="border border-gray-300 rounded-lg px-3 py-2 w-full" />
  <button class="bg-green-600 text-white px-4 py-2 rounded-lg">Войти</button>
</div>
3.4. Карточка экскурсии
<div class="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
  <h3 class="text-lg font-semibold mb-2">Название экскурсии</h3>
  <p class="text-sm text-gray-600 mb-1">22 апреля, 10:00</p>
  <p class="text-sm text-gray-600 mb-1">Экскурсовод: Иван Иванов</p>
  <p class="text-sm text-gray-600 mb-3">Мест: 10 / Резерв: 2</p>
  <button class="bg-green-600 text-white px-3 py-2 rounded-lg">Подробнее</button>
</div>
3.5. Модальное окно
<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white rounded-xl p-6 w-96">
    <h3 class="text-lg font-semibold mb-4">Запись на экскурсию</h3>
    <label class="block mb-2">Количество человек</label>
    <input type="number" min="1" max="3" class="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4" />
    <label class="flex items-center gap-2 mb-4">
      <input type="checkbox" />
      Нужен бинокль
    </label>
    <button class="bg-green-600 text-white px-4 py-2 rounded-lg w-full">Подтвердить</button>
  </div>
</div>
4. Навигация
Header:
<header class="flex justify-between items-center bg-white shadow px-6 py-3">
  <div class="text-xl font-semibold">BirdWatch</div>
  <nav class="flex gap-6">
    <a href="/excursions" class="text-gray-700 hover:text-green-600">Экскурсии</a>
    <a href="/my-bookings" class="text-gray-700 hover:text-green-600">Мои записи</a>
    <button class="text-gray-700 hover:text-green-600">Выйти</button>
  </nav>
</header>
5. Карта
Встраиваем Яндекс.Карты API или Google Maps в компонент с Tailwind:
<div id="map" class="w-full h-64 rounded-lg border border-gray-300"></div>
