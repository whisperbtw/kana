import type { ComputedRef, Ref } from 'vue';
import type { KanaChar } from '~/data/chars';
import type { AnswerState, KanaStats, QuizQuestion, StudyPhase } from '../core/types';

type ScoreContext = {
    hits: Ref<number>
    miss: Ref<number>
    getKanaStats: (char: string) => KanaStats
    getSessionKanaStats: (char: string) => KanaStats
    persistStats: () => void
    showFeedback: (isCorrect: boolean) => void
};

type NavigationContext = {
    scheduleTask: (callback: () => void, delayMs: number) => void
    showNextQuestion: () => void
};

function normalizeAnswer(value: string) {
    return value.trim().toLowerCase();
}

function recordResult(context: ScoreContext, chars: KanaChar[], isCorrect: boolean) {
    const counter = isCorrect ? 'hits' : 'miss';
    context[counter].value += 1;

    for (const char of chars) {
        context.getKanaStats(char.char)[counter] += 1;
        context.getSessionKanaStats(char.char)[counter] += 1;
    }

    context.showFeedback(isCorrect);
    context.persistStats();
}

export function createNormalAnswerHandler(context: ScoreContext & NavigationContext & {
    currentKana: ComputedRef<KanaChar | null>
    answer: Ref<string>
    answerState: Ref<AnswerState>
    currentIndex: Ref<number>
    quizList: Ref<QuizQuestion[]>
}) {
    return function submitNormalAnswer() {
        const current = context.currentKana.value;
        const input = normalizeAnswer(context.answer.value);
        if (!current || context.answerState.value !== 'ready' || !input) return;

        const acceptedAnswers = new Set([normalizeAnswer(current.romaji), normalizeAnswer(current.char)]);
        if (acceptedAnswers.has(input)) {
            context.answerState.value = 'correct';
            recordResult(context, [current], true);
            context.scheduleTask(() => {
                context.currentIndex.value += 1;
                context.showNextQuestion();
            }, 500);
            return;
        }

        context.answerState.value = 'wrong';
        context.answer.value = current.romaji;
        recordResult(context, [current], false);
        context.quizList.value.push({ mode: 'normal', char: current });
        context.scheduleTask(() => {
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    };
}

export function createComboAnswerHandler(context: ScoreContext & NavigationContext & {
    currentCombo: ComputedRef<KanaChar[]>
    answer: Ref<string>
    answerState: Ref<AnswerState>
    currentIndex: Ref<number>
    quizList: Ref<QuizQuestion[]>
}) {
    return function submitComboAnswer() {
        const combo = context.currentCombo.value;
        const input = normalizeAnswer(context.answer.value);
        if (combo.length !== 3 || context.answerState.value !== 'ready' || !input) return;

        const correctAnswer = combo.map((char) => char.romaji).join('');
        const correctKanaAnswer = combo.map((char) => char.char).join('');
        const isCorrect = new Set([normalizeAnswer(correctAnswer), normalizeAnswer(correctKanaAnswer)]).has(input);

        context.answerState.value = isCorrect ? 'correct' : 'wrong';
        recordResult(context, combo, isCorrect);

        if (isCorrect) {
            context.scheduleTask(() => {
                context.currentIndex.value += 1;
                context.showNextQuestion();
            }, 500);
            return;
        }

        context.answer.value = correctAnswer;
        context.quizList.value.push({ mode: 'combo', chars: [combo[0]!, combo[1]!, combo[2]!] });
        context.scheduleTask(() => {
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    };
}

export function createReverseAnswerHandler(context: ScoreContext & NavigationContext & {
    currentKana: ComputedRef<KanaChar | null>
    currentIndex: Ref<number>
    quizList: Ref<QuizQuestion[]>
    locked: Ref<boolean>
    selectedChar: Ref<string | null>
}) {
    return function checkReverseAnswer(option: KanaChar) {
        const current = context.currentKana.value;
        if (!current || context.locked.value) return;

        context.locked.value = true;
        context.selectedChar.value = option.char;
        const isCorrect = option.char === current.char;
        recordResult(context, [current], isCorrect);

        if (isCorrect) {
            context.scheduleTask(() => {
                context.currentIndex.value += 1;
                context.showNextQuestion();
            }, 800);
            return;
        }

        context.quizList.value.push({ mode: 'reverse', char: current });
        context.scheduleTask(() => {
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    };
}

export function createStudyAnswerHandlers(context: ScoreContext & NavigationContext & {
    currentKana: ComputedRef<KanaChar | null>
    answered: Ref<boolean>
    selectedOption: Ref<string | null>
    phase: Ref<StudyPhase>
    acknowledgeCard: (char: string) => void
    answerCard: (char: string, selectedRomaji: string, isCorrect: boolean) => void
}) {
    function continueAfterTeaching() {
        const current = context.currentKana.value;
        if (!current || context.answered.value) return;

        context.answered.value = true;
        context.acknowledgeCard(current.char);
        context.showFeedback(true);
        context.scheduleTask(context.showNextQuestion, 600);
    }

    function getOptionState(option: string) {
        if (context.phase.value === 'first' || !context.answered.value) return '';
        if (option === context.currentKana.value?.romaji) return 'correct';
        if (option === context.selectedOption.value) return 'wrong';
        return 'disabled';
    }

    function selectOption(option: string) {
        const current = context.currentKana.value;
        if (!current || context.answered.value) return;
        if (context.phase.value === 'first') {
            continueAfterTeaching();
            return;
        }

        context.answered.value = true;
        context.selectedOption.value = option;
        const isCorrect = option === current.romaji;
        recordResult(context, [current], isCorrect);
        context.answerCard(current.char, option, isCorrect);
        context.scheduleTask(context.showNextQuestion, isCorrect ? 800 : 1500);
    }

    return { getOptionState, selectOption };
}
