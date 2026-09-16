import { describe, expect, it } from 'vitest';
import type { KanaChar } from '../src/data/chars';
import type { StudyCard, StudySession } from '../src/composables/kanaQuiz/core/types';
import {
    acknowledgeStudyCard,
    answerStudyCard,
    buildStudyOptions,
    createStudyQuestionState,
    createStudySession,
    getNextStudyCard,
    getStudyProgress,
    isStudyComplete,
} from '../src/composables/kanaQuiz/study/study';

const chars: KanaChar[] = [
    { char: 'A', romaji: 'a', type: 'hira', group: 'basic' },
    { char: 'I', romaji: 'i', type: 'hira', group: 'basic' },
    { char: 'U', romaji: 'u', type: 'hira', group: 'basic' },
    { char: 'E', romaji: 'e', type: 'hira', group: 'basic' },
    { char: 'KA', romaji: 'ka', type: 'hira', group: 'basic' },
    { char: 'KI', romaji: 'ki', type: 'hira', group: 'basic' },
];

function card(kana: KanaChar, overrides: Partial<StudyCard> = {}): StudyCard {
    return {
        kana,
        stage: 'new',
        strength: 0,
        dueAt: 0,
        mistakes: 0,
        needsHint: false,
        confusions: {},
        ...overrides,
    };
}

describe('adaptive study progression', () => {
    it('introduces no more than three cards before revisiting learning cards', () => {
        let session = createStudySession(chars);

        for (let count = 0; count < 3; count += 1) {
            const next = getNextStudyCard(session)!;
            expect(next.stage).toBe('new');
            session = acknowledgeStudyCard(session, next.kana.char);
        }

        expect(getNextStudyCard(session)?.stage).not.toBe('new');
        expect(session.cards.filter((item) => item.stage !== 'new')).toHaveLength(3);
    });

    it('advances strength until mastery and reports completion', () => {
        let session = createStudySession([chars[0]!]);
        session = acknowledgeStudyCard(session, chars[0]!.char);

        for (let count = 0; count < 4; count += 1) {
            session = answerStudyCard(session, chars[0]!.char, 'a', true);
        }

        expect(session.cards[0]).toMatchObject({ stage: 'mastered', strength: 4, needsHint: false });
        expect(getStudyProgress(session)).toEqual({ mastered: 1, learning: 0, total: 1 });
        expect(isStudyComplete(session)).toBe(true);
    });

    it('penalizes an error, schedules an early retry and remembers the confusion', () => {
        const session: StudySession = {
            cards: [card(chars[0]!, { stage: 'review', strength: 3 })],
            questionNumber: 5,
            lastChar: null,
        };

        const next = answerStudyCard(session, chars[0]!.char, 'i', false);

        expect(next.cards[0]).toMatchObject({
            stage: 'learning',
            strength: 1,
            dueAt: 8,
            mistakes: 1,
            needsHint: true,
            confusions: { i: 1 },
        });
        expect(createStudyQuestionState(next.cards[0]!, ['a', 'i'])).toMatchObject({
            phase: 'relearn',
            value: 'a',
            tone: 'error',
            options: [],
        });

        const afterHint = acknowledgeStudyCard(next, chars[0]!.char);
        expect(afterHint.cards[0]).toMatchObject({ needsHint: false, dueAt: 9 });
    });

    it('prioritizes due cards without immediately repeating the last card', () => {
        const session: StudySession = {
            cards: [
                card(chars[0]!, { stage: 'learning', dueAt: 2 }),
                card(chars[1]!, { stage: 'learning', dueAt: 2 }),
                card(chars[2]!, { stage: 'learning', dueAt: 7 }),
            ],
            questionNumber: 3,
            lastChar: chars[0]!.char,
        };

        expect(getNextStudyCard(session)?.kana.char).toBe(chars[1]!.char);
    });
});

describe('adaptive study options', () => {
    it('uses only introduced cards as alternatives and keeps romaji unique', () => {
        const current = card(chars[0]!, { stage: 'learning' });
        const introduced = card(chars[1]!, { stage: 'review' });
        const session: StudySession = {
            cards: [current, introduced, card(chars[2]!), card(chars[3]!)],
            questionNumber: 2,
            lastChar: null,
        };

        const options = buildStudyOptions(session, current);

        expect(new Set(options)).toEqual(new Set(['a', 'i']));
        expect(options).not.toContain('u');
        expect(options).not.toContain('e');
    });

    it('prioritizes a previously confused answer among alternatives', () => {
        const current = card(chars[0]!, { stage: 'review', confusions: { e: 3 } });
        const session: StudySession = {
            cards: [current, ...chars.slice(1).map((kana) => card(kana, { stage: 'learning' }))],
            questionNumber: 4,
            lastChar: null,
        };

        expect(buildStudyOptions(session, current)).toContain('e');
    });
});
