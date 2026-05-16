// src/features/achievements/api.ts — временный мок до появления бэка
import { type Achievement, type UserAchievement } from "./schemas";

const MOCK_CATALOG: Achievement[] = [
  { code: "pioneer", name: "Первооткрыватель", description: "Чек-ины в 5+ разных мест", icon_url: null, order: 10 },
  { code: "critic", name: "Ресторанный критик", description: "15+ отзывов с фото", icon_url: null, order: 20 },
  { code: "night_watch", name: "Ночной дозор", description: "10+ чек-инов после 00:00", icon_url: null, order: 30 },
  { code: "social_butterfly", name: "Душа компании", description: "5+ принятых заявок в друзья", icon_url: null, order: 40 },
  { code: "paparazzi", name: "Папарацци", description: "50+ фото и 100+ лайков", icon_url: null, order: 50 },
];

export async function fetchAchievementsCatalog(): Promise<Achievement[]> {
  return Promise.resolve(MOCK_CATALOG);
}

export async function fetchMyAchievements(): Promise<UserAchievement[]> {
  // Для теста UI с unlocked-состоянием — подмени пустой массив на один-два:
  return Promise.resolve([]);
}