import type { ComputedRef, Ref } from 'vue';
import type { KanaChar } from '~/data/chars';
import { XP_REWARD } from '../core/constants';
import type { StudyCharStat } from '../core/types';

type CommonContext = {
    addXp: (amount: number) => void
    ensureKanaStats: (char: string) => void
    getKanaStats: (char: string) => { hits: number; miss: number }
    persistStats: () => void
    scheduleTask: (callback: () => void, delayMs: number) => void
    showFeedback: (isCorrect: boolean) => void
    showNextQuestion: () => void
}

export function createKanaQuizAnswerHandlers(context: CommonContext & {
    currentKana: ComputedRef<KanaChar | null>
    currentCombo: ComputedRef<KanaChar[]>
    normalAnswer: Ref<string>
    normalInputDisabled: Ref<boolean>
    normalInputError: Ref<boolean>
    comboAnswer: Ref<string>
    comboInputDisabled: Ref<boolean>
    comboInputError: Ref<boolean>
    hits: Ref<number>
    miss: Ref<number>
    currentIndex: Ref<number>
    quizList: Ref<(KanaChar | KanaChar[])[]>
    reverseLocked: Ref<boolean>
    reverseSelectedChar: Ref<string | null>
    activeCharPool: Ref<KanaChar[]>
    repetitionsPerChar: Ref<number>
    selectedCharsSession: Ref<KanaChar[]>
    studyCharStats: Ref<Record<string, StudyCharStat>>
    studyAnswered: Ref<boolean>
    studySelectedOption: Ref<string | null>
    studyPhase: Ref<'first' | 'practice' | 'relearn'>
    getStudyStats: (char: string) => StudyCharStat
    isStudyComplete: () => boolean
    refreshStudyQuizList: () => void
    unlockNextStudyCharIfNeeded: () => void
}) {
    function submitAnswer() {
        const current = context.currentKana.value;
        const input = context.normalAnswer.value.trim().toLowerCase();

        if (!current || context.normalInputDisabled.value || !input) return;

        context.ensureKanaStats(current.char);

        if (input === current.romaji) {
            context.hits.value += 1;
            context.getKanaStats(current.char).hits += 1;
            context.addXp(XP_REWARD.normal);
            context.showFeedback(true);
            context.persistStats();
            context.currentIndex.value += 1;
            context.scheduleTask(context.showNextQuestion, 300);
            return;
        }

        context.miss.value += 1;
        context.getKanaStats(current.char).miss += 1;
        context.normalAnswer.value = current.romaji;
        context.normalInputDisabled.value = true;
        context.normalInputError.value = true;
        context.showFeedback(false);
        context.persistStats();
        context.quizList.value.push(current);

        context.scheduleTask(() => {
            context.normalInputDisabled.value = false;
            context.normalInputError.value = false;
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    }

    function submitComboAnswer() {
        const combo = context.currentCombo.value;
        const input = context.comboAnswer.value.trim().toLowerCase();

        if (!combo.length || context.comboInputDisabled.value || !input) return;

        const correctAnswer = combo.map((char) => char.romaji).join('');

        for (const char of combo) {
            context.ensureKanaStats(char.char);
        }

        if (input === correctAnswer) {
            context.hits.value += 1;

            for (const char of combo) {
                context.getKanaStats(char.char).hits += 1;
            }

            context.addXp(XP_REWARD.combo);
            context.showFeedback(true);
            context.persistStats();
            context.currentIndex.value += 1;
            context.scheduleTask(context.showNextQuestion, 300);
            return;
        }

        context.miss.value += 1;

        for (const char of combo) {
            context.getKanaStats(char.char).miss += 1;
        }

        context.comboAnswer.value = correctAnswer;
        context.comboInputDisabled.value = true;
        context.comboInputError.value = true;
        context.showFeedback(false);
        context.persistStats();
        context.quizList.value.push([...combo]);

        context.scheduleTask(() => {
            context.comboInputDisabled.value = false;
            context.comboInputError.value = false;
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    }

    function checkReverseAnswer(option: KanaChar) {
        const current = context.currentKana.value;
        if (!current || context.reverseLocked.value) return;

        context.reverseLocked.value = true;
        context.reverseSelectedChar.value = option.char;
        context.ensureKanaStats(current.char);

        if (option.char === current.char) {
            context.hits.value += 1;
            context.getKanaStats(current.char).hits += 1;
            context.addXp(XP_REWARD.reverse);
            context.showFeedback(true);
            context.persistStats();
            context.currentIndex.value += 1;
            context.scheduleTask(context.showNextQuestion, 800);
            return;
        }

        context.miss.value += 1;
        context.getKanaStats(current.char).miss += 1;
        context.showFeedback(false);
        context.persistStats();
        context.quizList.value.push(current);

        context.scheduleTask(() => {
            context.currentIndex.value += 1;
            context.showNextQuestion();
        }, 2000);
    }

    function markFirstTimeAndContinue() {
        const current = context.currentKana.value;
        if (!current) return;

        context.getStudyStats(current.char).firstTime = false;
        context.showFeedback(true);
        context.currentIndex.value += 1;
        context.scheduleTask(context.showNextQuestion, 600);
    }

    function getStudyOptionState(option: string) {
        if (context.studyPhase.value === 'first' || !context.studyAnswered.value) return '';
        if (option === context.currentKana.value?.romaji) return 'correct';
        if (option === context.studySelectedOption.value) return 'wrong';
        return 'disabled';
    }

    function handleStudyOption(option: string) {
        const current = context.currentKana.value;
        if (!current || context.studyAnswered.value) return;

        if (context.studyPhase.value === 'first') {
            markFirstTimeAndContinue();
            return;
        }

        const stats = context.getStudyStats(current.char);
        context.studyAnswered.value = true;
        context.studySelectedOption.value = option;
        context.ensureKanaStats(current.char);

        if (option === current.romaji) {
            context.hits.value += 1;
            context.getKanaStats(current.char).hits += 1;
            context.addXp(XP_REWARD.study);
            stats.correct += 1;
            stats.incorrect = 0;
            stats.teach = false;
            context.showFeedback(true);
            context.persistStats();

            if (context.isStudyComplete()) {
                context.scheduleTask(context.showNextQuestion, 800);
                return;
            }

            if (stats.correct >= context.repetitionsPerChar.value) {
                context.activeCharPool.value = context.activeCharPool.value.filter((char) => char.char !== current.char);
                context.unlockNextStudyCharIfNeeded();
            }

            if (context.activeCharPool.value.length > 0) {
                context.refreshStudyQuizList();
            } else {
                context.quizList.value = [];
            }

            context.scheduleTask(context.showNextQuestion, 800);
            return;
        }

        context.miss.value += 1;
        context.getKanaStats(current.char).miss += 1;
        stats.incorrect += 1;

        if (stats.incorrect >= 2) {
            stats.teach = true;
        }

        context.showFeedback(false);
        context.persistStats();

        context.scheduleTask(() => {
            context.refreshStudyQuizList();
            context.showNextQuestion();
        }, 1500);
    }

    return {
        checkReverseAnswer,
        getStudyOptionState,
        handleStudyOption,
        submitAnswer,
        submitComboAnswer,
    };
}
