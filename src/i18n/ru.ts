// src/i18n/ru.ts
export const ru = {
  // Navigation
  'nav.map': 'Карта',
  'nav.feed': 'Лента',
  'nav.friends': 'Друзья',
  'nav.profile': 'Профиль',

  // Common
  'common.cancel': 'Отмена',
  'common.save': 'Сохранить',
  'common.delete': 'Удалить',
  'common.confirm': 'Подтвердить',
  'common.back': 'Назад',
  'common.loading': 'Загрузка…',
  'common.error': 'Что-то пошло не так',
  'common.retry': 'Попробовать снова',
  'common.empty': 'Пока пусто',

  // Auth
  'auth.login.title': 'Войти в Go',
  'auth.login.google': 'Продолжить с Google',
  'auth.login.sms': 'Войти по номеру',
  'auth.onboarding.title': 'Расскажи о себе',
  'auth.logout': 'Выйти',

  // Vibes
  'vibe.calm': 'Спокойно',
  'vibe.active': 'Активно',
  'vibe.productive': 'Продуктивно',
  'vibe.romantic': 'Романтично',
  'vibe.musical': 'Музыкально',
  'vibe.gaming': 'Игровое',
  'vibe.networking': 'Нетворкинг',

  // Map
  'map.locationDenied': 'Разрешите доступ к геолокации',
  'map.checkin': 'Чек-ин',
  'map.openInMap': 'Открыть на карте',

  // Feed
  'feed.empty': 'Добавь друзей, чтобы видеть их чек-ины',

  // Friends
  'friends.tabs.list': 'Друзья',
  'friends.tabs.incoming': 'Входящие',
  'friends.tabs.outgoing': 'Исходящие',
  'friends.add': 'Добавить в друзья',
  'friends.requestSent': 'Заявка отправлена',
  'friends.accept': 'Принять',
  'friends.decline': 'Отклонить',
  'friends.remove': 'Удалить из друзей',

  // Profile
  'profile.edit': 'Редактировать',
  'profile.checkins': 'Чек-ины',
  'profile.points': 'поинтов',

  // AI
  'ai.title': 'Куда пойти?',
  'ai.placeholder': 'Спроси что-нибудь…',
  'ai.thinking': 'Думаю…',
  'ai.rateLimit': 'Слишком много запросов. Попробуй через минуту.',
} as const;

export type TranslationKey = keyof typeof ru;
