import { describe, expect, it } from 'vitest';
import type { KanaChar } from '../src/data/chars';
import {
    buildReverseOptions,
    createComboQuizList,
    createStandardQuizList,
} from '../src/composables/kanaQuiz/flow/modes';

const chars: KanaChar[] = [
    { char: 'あ', romaji: 'a', type: 'hira', group: 'basic' },
    { char: 'い', romaji: 'i', type: 'hira', group: 'basic' },
    { char: 'う', romaji: 'u', type: 'hira', group: 'basic' },
    { char: 'え', romaji: 'e', type: 'hira', group: 'basic' },
    { char: 'お', romaji: 'o', type: 'hira', group: 'basic' },
    { char: 'ア', romaji: 'a', type: 'kata', group: 'basic' },
];

describe('quiz list generation', () => {
    it('keeps every selected character in every combo repetition', () => {
        const selected = chars.slice(0, 4);
        const questions = createComboQuizList(selected, 2);
        const appearances = new Map(selected.map((char) => [char.char, 0]));

        for (const question of questions) {
            expect(new Set(question.chars.map((char) => char.char)).size).toBe(3);
            for (const char of question.chars) {
                if (appearances.has(char.char)) appearances.set(char.char, appearances.get(char.char)! + 1);
            }
        }

        expect([...appearances.values()].every((count) => count >= 2)).toBe(true);
    });

    it('tags standard questions with their mode', () => {
        const questions = createStandardQuizList(chars.slice(0, 2), 2, 'reverse');
        expect(questions).toHaveLength(4);
        expect(questions.every((question) => question.mode === 'reverse')).toBe(true);
    });
});

describe('answer options', () => {
    it('does not offer an ambiguous reverse option', () => {
        const options = buildReverseOptions(chars[0]!, chars);
        expect(options.some((option) => option.char === 'ア')).toBe(false);
    });
});
