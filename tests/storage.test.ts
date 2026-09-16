import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STATS_STORAGE_KEY } from '../src/composables/kanaQuiz/core/constants';
import { loadStoredStats, saveStoredStats } from '../src/composables/kanaQuiz/persistence/storage';

const values = new Map<string, string>();

beforeEach(() => {
    values.clear();
    vi.stubGlobal('localStorage', {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('stats storage', () => {
    it('migrates the old aggregate schema without retaining session counters', () => {
        values.set(STATS_STORAGE_KEY, JSON.stringify({
            hits: 99,
            miss: 12,
            perKana: { 'あ': { hits: 3, miss: 1 } },
        }));

        expect(loadStoredStats()).toEqual({ perKana: { 'あ': { hits: 3, miss: 1 } } });
    });

    it('sanitizes malformed persisted values', () => {
        values.set(STATS_STORAGE_KEY, JSON.stringify({
            perKana: {
                'あ': { hits: -3, miss: 'invalid' },
                'い': null,
            },
        }));

        expect(loadStoredStats()).toEqual({ perKana: { 'あ': { hits: 0, miss: 0 } } });
    });

    it('only saves persistent per-character statistics', () => {
        saveStoredStats({ perKana: { 'う': { hits: 2, miss: 0 } } });
        expect(JSON.parse(values.get(STATS_STORAGE_KEY)!)).toEqual({
            perKana: { 'う': { hits: 2, miss: 0 } },
        });
    });
});
