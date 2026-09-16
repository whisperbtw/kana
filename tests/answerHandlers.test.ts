import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { KanaChar } from '../src/data/chars';
import type { KanaStats, QuizQuestion } from '../src/composables/kanaQuiz/core/types';
import {
    createComboAnswerHandler,
    createNormalAnswerHandler,
    createStudyAnswerHandlers,
} from '../src/composables/kanaQuiz/flow/answerHandlers';

const kana: KanaChar = { char: 'あ', romaji: 'a', type: 'hira', group: 'basic' };

describe('normal answer handler', () => {
    it('locks a correct answer before scheduling the next question', () => {
        const quizList = ref<QuizQuestion[]>([
            { mode: 'normal', char: kana },
            { mode: 'normal', char: kana },
        ]);
        const currentIndex = ref(0);
        const answer = ref('a');
        const answerState = ref<'ready' | 'correct' | 'wrong'>('ready');
        const hits = ref(0);
        const miss = ref(0);
        const perKana: Record<string, KanaStats> = { [kana.char]: { hits: 0, miss: 0 } };
        const scheduled: Array<() => void> = [];
        const persistStats = vi.fn();
        const showFeedback = vi.fn();
        const handler = createNormalAnswerHandler({
            answer,
            answerState,
            currentIndex,
            currentKana: computed(() => {
                const question = quizList.value[currentIndex.value];
                return question?.mode === 'normal' ? question.char : null;
            }),
            getKanaStats: (char) => perKana[char]!,
            getSessionKanaStats: () => ({ hits: 0, miss: 0 }),
            hits,
            miss,
            persistStats,
            quizList,
            scheduleTask: (callback) => scheduled.push(callback),
            showFeedback,
            showNextQuestion: vi.fn(),
        });

        handler();
        handler();

        expect(answerState.value).toBe('correct');
        expect(currentIndex.value).toBe(0);
        expect(hits.value).toBe(1);
        expect(perKana[kana.char]?.hits).toBe(1);
        expect(scheduled).toHaveLength(1);
        expect(persistStats).toHaveBeenCalledOnce();
        expect(showFeedback).toHaveBeenCalledOnce();

        scheduled[0]!();
        expect(currentIndex.value).toBe(1);
    });
});

describe('combo answer handler', () => {
    it('locks the whole combo before scheduling its transition', () => {
        const combo = [
            kana,
            { ...kana, char: 'い', romaji: 'i' },
            { ...kana, char: 'う', romaji: 'u' },
        ];
        const quizList = ref<QuizQuestion[]>([
            { mode: 'combo', chars: [combo[0]!, combo[1]!, combo[2]!] },
        ]);
        const answerState = ref<'ready' | 'correct' | 'wrong'>('ready');
        const hits = ref(0);
        const perKana = Object.fromEntries(combo.map((char) => [char.char, { hits: 0, miss: 0 }]));
        const scheduled: Array<() => void> = [];
        const handler = createComboAnswerHandler({
            answer: ref('aiu'),
            answerState,
            currentCombo: computed(() => combo),
            currentIndex: ref(0),
            getKanaStats: (char) => perKana[char]!,
            getSessionKanaStats: () => ({ hits: 0, miss: 0 }),
            hits,
            miss: ref(0),
            persistStats: vi.fn(),
            quizList,
            scheduleTask: (callback) => scheduled.push(callback),
            showFeedback: vi.fn(),
            showNextQuestion: vi.fn(),
        });

        handler();
        handler();

        expect(answerState.value).toBe('correct');
        expect(hits.value).toBe(1);
        expect(Object.values(perKana).every((stats) => stats.hits === 1)).toBe(true);
        expect(scheduled).toHaveLength(1);
    });
});

describe('study answer handler', () => {
    function createStudyHarness() {
        const answered = ref(false);
        const selectedOption = ref<string | null>(null);
        const hits = ref(0);
        const miss = ref(0);
        const stats = { hits: 0, miss: 0 };
        const scheduled: Array<() => void> = [];
        const showFeedback = vi.fn();
        const answerCard = vi.fn();
        const handlers = createStudyAnswerHandlers({
            acknowledgeCard: vi.fn(),
            answerCard,
            answered,
            currentKana: computed(() => kana),
            getKanaStats: () => stats,
            getSessionKanaStats: () => ({ hits: 0, miss: 0 }),
            hits,
            miss,
            persistStats: vi.fn(),
            phase: ref<'practice'>('practice'),
            scheduleTask: (callback) => scheduled.push(callback),
            selectedOption,
            showFeedback,
            showNextQuestion: vi.fn(),
        });

        return { answered, answerCard, handlers, hits, miss, scheduled, selectedOption, showFeedback, stats };
    }

    it('keeps the answered card stable while showing correct feedback', () => {
        const harness = createStudyHarness();

        harness.handlers.selectOption('a');
        harness.handlers.selectOption('i');

        expect(harness.answered.value).toBe(true);
        expect(harness.handlers.getOptionState('a')).toBe('correct');
        expect(harness.hits.value).toBe(1);
        expect(harness.stats.hits).toBe(1);
        expect(harness.showFeedback).toHaveBeenCalledExactlyOnceWith(true);
        expect(harness.answerCard).toHaveBeenCalledExactlyOnceWith(kana.char, 'a', true);
        expect(harness.scheduled).toHaveLength(1);
    });

    it('marks the selected option wrong and the real answer correct', () => {
        const harness = createStudyHarness();

        harness.handlers.selectOption('i');

        expect(harness.handlers.getOptionState('i')).toBe('wrong');
        expect(harness.handlers.getOptionState('a')).toBe('correct');
        expect(harness.miss.value).toBe(1);
        expect(harness.stats.miss).toBe(1);
        expect(harness.showFeedback).toHaveBeenCalledExactlyOnceWith(false);
        expect(harness.answerCard).toHaveBeenCalledExactlyOnceWith(kana.char, 'i', false);
    });
});
