import { allChars, type KanaChar } from '~/data/chars'
import type { IndexedKanaChar, KanaMode, QuizSection } from './types'

export const THEME_STORAGE_KEY = 'kanaTheme';
export const STATS_STORAGE_KEY = 'kanaStats';
export const PROFILE_STORAGE_KEY = 'kanaProfileV1';

export const XP_REWARD = Object.freeze({
    normal: 10,
    reverse: 10,
    combo: 16,
    study: 12,
});

const SECTION_DEFINITIONS = [
    {
        title: 'Hiragana B\u00E1sico',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'basic',
    },
    {
        title: 'Hiragana Dakuten (\u309B)',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'dakuten',
    },
    {
        title: 'Hiragana Handakuten (\u309C)',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'handakuten',
    },
    {
        title: 'Katakana B\u00E1sico',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'basic',
    },
    {
        title: 'Katakana Dakuten (\u309B)',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'dakuten',
    },
    {
        title: 'Katakana Handakuten (\u309C)',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'handakuten',
    },
] as const;

export const ALL_CHARS_WITH_INDEX: IndexedKanaChar[] = allChars.map((char, index) => ({ ...char, index }));

export const SECTION_SETS: QuizSection[] = SECTION_DEFINITIONS.map((section) => ({
    title: section.title,
    chars: ALL_CHARS_WITH_INDEX.filter(section.filter),
}));

export function getSectionsForMode(mode: KanaMode) {
    if (mode === 'all') {
        return SECTION_SETS;
    }

    return SECTION_SETS.filter((section) => section.chars[0]?.type === mode);
}
