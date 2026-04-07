import {
    PROFILE_STORAGE_KEY,
    STATS_STORAGE_KEY,
    THEME_STORAGE_KEY,
} from '../core/constants';
import {
    createDefaultProfile,
    normalizeProfile,
} from '../profile/profile';
import type { PersistedStats, Profile, ThemeMode } from '../core/types';
import { createDefaultStats } from '../shared/utils';

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
        const parsed = JSON.parse(rawStats) as PersistedStats;

        return {
            hits: parsed.hits || 0,
            miss: parsed.miss || 0,
            perKana: parsed.perKana || {},
        };
    } catch {
        return createDefaultStats();
    }
}

export function saveStoredStats(stats: PersistedStats) {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function loadStoredProfile(): Profile {
    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!rawProfile) {
        const defaultProfile = createDefaultProfile();
        saveStoredProfile(defaultProfile);
        return defaultProfile;
    }

    try {
        return normalizeProfile(JSON.parse(rawProfile) as Partial<Profile>);
    } catch {
        return createDefaultProfile();
    }
}

export function saveStoredProfile(profile: Profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
