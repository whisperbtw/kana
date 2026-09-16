import {
    STATS_STORAGE_KEY,
    THEME_STORAGE_KEY,
} from '../core/constants';
import type { PersistedStats, ThemeMode } from '../core/types';
import { createDefaultStats } from '../shared/utils';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseKanaStats(value: unknown) {
    if (!isRecord(value)) return null;

    const hits = typeof value.hits === 'number' && Number.isFinite(value.hits) && value.hits >= 0 ? value.hits : 0;
    const miss = typeof value.miss === 'number' && Number.isFinite(value.miss) && value.miss >= 0 ? value.miss : 0;
    return { hits, miss };
}

export function loadStoredTheme(): ThemeMode | null {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
}

export function saveStoredTheme(theme: ThemeMode) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function loadStoredStats(): PersistedStats {
    const rawStats = localStorage.getItem(STATS_STORAGE_KEY);

    if (!rawStats) {
        return createDefaultStats();
    }

    try {
        const parsed: unknown = JSON.parse(rawStats);
        if (!isRecord(parsed) || !isRecord(parsed.perKana)) {
            return createDefaultStats();
        }

        const perKana: PersistedStats['perKana'] = {};
        for (const [char, value] of Object.entries(parsed.perKana)) {
            const stats = parseKanaStats(value);
            if (stats) perKana[char] = stats;
        }

        return { perKana };
    } catch {
        return createDefaultStats();
    }
}

export function saveStoredStats(stats: PersistedStats) {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}
