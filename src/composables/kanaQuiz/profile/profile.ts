import type { Profile } from '../core/types'

export function getXpRequiredForLevel(level: number) {
    return 80 + (level - 1) * 35;
}

export function getRankByLevel(level: number) {
    if (level >= 35) return 'Master';
    if (level >= 25) return 'Diamond';
    if (level >= 15) return 'Gold';
    if (level >= 8) return 'Silver';
    return 'Bronze';
}

export function createDefaultProfile(): Profile {
    return {
        version: 1,
        level: 1,
        xp: 0,
        totalXp: 0,
        rank: getRankByLevel(1),
        updatedAt: Date.now(),
    };
}

export function normalizeProfile(rawProfile: Partial<Profile>): Profile {
    const profile = { ...createDefaultProfile(), ...rawProfile };
    profile.level = Number.isFinite(profile.level) && profile.level > 0 ? Math.floor(profile.level) : 1;
    profile.xp = Number.isFinite(profile.xp) && profile.xp >= 0 ? Math.floor(profile.xp) : 0;
    profile.totalXp = Number.isFinite(profile.totalXp) && profile.totalXp >= 0 ? Math.floor(profile.totalXp) : 0;

    while (profile.xp >= getXpRequiredForLevel(profile.level)) {
        profile.xp -= getXpRequiredForLevel(profile.level);
        profile.level += 1;
    }

    profile.rank = getRankByLevel(profile.level);
    profile.updatedAt = Date.now();
    return profile;
}
