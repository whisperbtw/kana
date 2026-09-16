import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { allChars, type KanaChar } from '~/data/chars';
import { getSectionsForMode } from './kanaQuiz/core/constants';
import type {
    AnswerState,
    KanaMode,
    KanaStats,
    ModalButton,
    QuizMode,
    QuizQuestion,
    StudyPhase,
    StudySession,
    TeachingTone,
    ThemeMode,
} from './kanaQuiz/core/types';
import {
    buildReverseOptions as createReverseOptions,
    createComboQuizList,
    createStandardQuizList,
} from './kanaQuiz/flow/modes';
import {
    loadStoredStats,
    loadStoredTheme,
    saveStoredStats,
    saveStoredTheme,
} from './kanaQuiz/persistence/storage';
import { getElapsedTimeText } from './kanaQuiz/flow/timer';
import {
    acknowledgeStudyCard,
    answerStudyCard,
    buildStudyOptions,
    createStudySession,
    createStudyQuestionState,
    getNextStudyCard,
    getStudyProgress,
    isStudyComplete,
} from './kanaQuiz/study/study';
import { useKanaQuizRuntime } from './kanaQuiz/flow/runtime';
import {
    createComboAnswerHandler,
    createNormalAnswerHandler,
    createReverseAnswerHandler,
    createStudyAnswerHandlers,
} from './kanaQuiz/flow/answerHandlers';

export type {
    AnswerState,
    IndexedKanaChar,
    KanaMode,
    ModalButton,
    ModalState,
    QuizMode,
    QuizSection,
    StudyPhase,
    TeachingTone,
} from './kanaQuiz/core/types';

export function useKanaQuiz() {
    const mode = ref<KanaMode>('all');
    const quizType = ref<QuizMode>('normal');
    const repeat = ref(3);
    const theme = ref<ThemeMode>('light');

    const selectedCharIds = ref<number[]>([]);
    const selectedCharsSession = ref<KanaChar[]>([]);

    const hits = ref(0);
    const miss = ref(0);
    const perKana = ref<Record<string, KanaStats>>({});
    const sessionKanaStats = ref<Record<string, KanaStats>>({});

    const quizStarted = ref(false);
    const questionVisible = ref(false);
    const activeQuizMode = ref<QuizMode>('normal');
    const quizList = ref<QuizQuestion[]>([]);
    const currentIndex = ref(0);
    const progressText = ref('');
    const repetitionsPerChar = ref(0);

    const normalAnswer = ref('');
    const comboAnswer = ref('');
    const normalAnswerState = ref<AnswerState>('ready');
    const comboAnswerState = ref<AnswerState>('ready');

    const reverseOptions = ref<KanaChar[]>([]);
    const reverseLocked = ref(false);
    const reverseSelectedChar = ref<string | null>(null);

    const studySession = ref<StudySession | null>(null);
    const studyPhase = ref<StudyPhase>('practice');
    const studyOptions = ref<string[]>([]);
    const studyAnswered = ref(false);
    const studySelectedOption = ref<string | null>(null);
    const studyTeachingPrefix = ref('');
    const studyTeachingValue = ref('');
    const studyTeachingTone = ref<TeachingTone>('primary');

    const normalAnswerRef = ref<HTMLInputElement | null>(null);
    const comboAnswerRef = ref<HTMLInputElement | null>(null);
    let hasHydrated = false;

    const {
        cleanupRuntime,
        clearPendingTimeouts,
        dismissModal,
        feedback,
        handleModalAction,
        modal,
        resetFeedback,
        resetRuntimeState,
        scheduleTask,
        showFeedback,
        showModal,
        startRoundWithCountdown: beginRoundWithCountdown,
        startTime,
        stopPreStartCountdown,
        stopTimer,
        timerText,
    } = useKanaQuizRuntime();

    const isDark = computed(() => theme.value === 'dark');
    const sections = computed(() => getSectionsForMode(mode.value));

    const currentEntry = computed(() => quizList.value[currentIndex.value] ?? null);
    const currentKana = computed<KanaChar | null>(() => {
        const entry = currentEntry.value;
        return entry && entry.mode !== 'combo' ? entry.char : null;
    });
    const currentCombo = computed<KanaChar[]>(() => {
        const entry = currentEntry.value;
        return entry?.mode === 'combo' ? entry.chars : [];
    });
    const currentCharText = computed(() => currentKana.value?.char ?? '');
    const currentRomajiText = computed(() => currentKana.value?.romaji ?? '');

    watch(
        mode,
        () => {
            selectedCharIds.value = sections.value.flatMap((section) => section.chars.map((char) => char.index));
        },
        { immediate: true },
    );

    watch(theme, (value) => {
        if (!import.meta.client || !hasHydrated) return;
        document.body.classList.toggle('dark', value === 'dark');
        saveStoredTheme(value);
    });

    onMounted(() => {
        hydrateStoredState();
        hasHydrated = true;
        document.body.classList.toggle('dark', isDark.value);
        document.documentElement.dataset.kanaReady = 'true';
    });

    onBeforeUnmount(() => {
        cleanupRuntime();
        delete document.documentElement.dataset.kanaReady;
    });

    function hydrateStoredState() {
        const savedTheme = loadStoredTheme();

        if (savedTheme) {
            theme.value = savedTheme;
        }

        perKana.value = loadStoredStats().perKana;
    }

    function persistStats() {
        if (!import.meta.client) return;

        saveStoredStats({
            perKana: perKana.value,
        });
    }

    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
    }

    function setSectionSelection(indices: number[], checked: boolean) {
        const nextSelection = new Set(selectedCharIds.value);

        for (const index of indices) {
            if (checked) nextSelection.add(index);
            else nextSelection.delete(index);
        }

        selectedCharIds.value = Array.from(nextSelection).sort((first, second) => first - second);
    }

    function resetInputs() {
        normalAnswer.value = '';
        comboAnswer.value = '';
        normalAnswerState.value = 'ready';
        comboAnswerState.value = 'ready';
        reverseOptions.value = [];
        reverseLocked.value = false;
        reverseSelectedChar.value = null;
        studyOptions.value = [];
        studyAnswered.value = false;
        studySelectedOption.value = null;
        studyPhase.value = 'practice';
        studyTeachingPrefix.value = '';
        studyTeachingValue.value = '';
        studyTeachingTone.value = 'primary';
    }

    function resetSessionState() {
        resetRuntimeState();
        hits.value = 0;
        miss.value = 0;
        currentIndex.value = 0;
        progressText.value = '';
        repetitionsPerChar.value = 0;
        quizList.value = [];
        selectedCharsSession.value = [];
        sessionKanaStats.value = {};
        studySession.value = null;
        resetInputs();
    }

    function ensureKanaStats(char: string) {
        if (!perKana.value[char]) {
            perKana.value[char] = { hits: 0, miss: 0 };
        }
    }

    function getKanaStats(char: string) {
        ensureKanaStats(char);
        return perKana.value[char]!;
    }

    function getSessionKanaStats(char: string) {
        if (!sessionKanaStats.value[char]) {
            sessionKanaStats.value[char] = { hits: 0, miss: 0 };
        }

        return sessionKanaStats.value[char]!;
    }

    function buildReverseOptions(current: KanaChar) {
        reverseOptions.value = createReverseOptions(current, selectedCharsSession.value);
        reverseLocked.value = false;
        reverseSelectedChar.value = null;
    }

    function requireStudySession() {
        if (!studySession.value) throw new Error('Study session is not initialized');
        return studySession.value;
    }

    function showNextStudyQuestion() {
        const session = requireStudySession();
        if (isStudyComplete(session)) {
            finishQuiz();
            return;
        }

        const card = getNextStudyCard(session);
        if (!card) {
            finishQuiz();
            return;
        }

        quizList.value = [{ mode: 'study', char: card.kana }];
        currentIndex.value = 0;
        questionVisible.value = true;

        const progress = getStudyProgress(session);
        const options = card.stage === 'new' ? ['Entendi'] : buildStudyOptions(session, card);
        const nextQuestionState = createStudyQuestionState(card, options);

        progressText.value = `${progress.mastered} de ${progress.total} dominados · ${progress.learning} em estudo`;
        studyAnswered.value = false;
        studySelectedOption.value = null;
        studyPhase.value = nextQuestionState.phase;
        studyTeachingPrefix.value = nextQuestionState.prefix;
        studyTeachingValue.value = nextQuestionState.value;
        studyTeachingTone.value = nextQuestionState.tone;
        studyOptions.value = nextQuestionState.options;

        if (nextQuestionState.phase === 'relearn') {
            const relearningChar = card.kana.char;
            const continueAfterHint = () => {
                if (modal.value) {
                    scheduleTask(continueAfterHint, 250);
                    return;
                }

                const currentSession = studySession.value;
                if (!currentSession || currentKana.value?.char !== relearningChar) return;

                studySession.value = acknowledgeStudyCard(currentSession, relearningChar);
                showNextQuestion();
            };

            scheduleTask(continueAfterHint, 1800);
        }
    }

    function showNextQuestion() {
        resetFeedback();

        if (activeQuizMode.value === 'study') {
            showNextStudyQuestion();
            return;
        }

        if (currentIndex.value >= quizList.value.length) {
            finishQuiz();
            return;
        }

        questionVisible.value = true;
        const question = currentEntry.value;
        if (!question) {
            finishQuiz();
            return;
        }

        progressText.value = `Quest\u00E3o ${currentIndex.value + 1} de ${quizList.value.length}`;

        if (question.mode === 'normal') {
            normalAnswer.value = '';
            normalAnswerState.value = 'ready';
            nextTick(() => normalAnswerRef.value?.focus());
            return;
        }

        if (question.mode === 'combo') {
            comboAnswer.value = '';
            comboAnswerState.value = 'ready';
            nextTick(() => comboAnswerRef.value?.focus());
            return;
        }

        if (currentKana.value) {
            buildReverseOptions(currentKana.value);
        }
    }

    function startRoundWithCountdown() {
        questionVisible.value = false;
        progressText.value = 'Prepare-se...';
        beginRoundWithCountdown(showNextQuestion);
    }

    function finishQuiz() {
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();
        resetFeedback();

        const reviewItems = selectedCharsSession.value.flatMap((char) => {
            const stats = sessionKanaStats.value[char.char];
            return stats?.miss ? [{ char: char.char, romaji: char.romaji, misses: stats.miss }] : [];
        }).sort((first, second) => second.misses - first.misses);
        const mastery = activeQuizMode.value === 'study' && studySession.value
            ? getStudyProgress(studySession.value)
            : null;
        const confusions = studySession.value?.cards.flatMap((card) => {
            return Object.entries(card.confusions).map(([selected, count]) => ({
                char: card.kana.char,
                expected: card.kana.romaji,
                selected,
                count,
            }));
        }).sort((first, second) => second.count - first.count).slice(0, 4) ?? [];
        const buttons: ModalButton[] = reviewItems.length > 0
            ? [
                { label: 'Encerrar', variant: 'secondary', onClick: exitQuiz },
                { label: 'Revisar meus erros', variant: 'primary', onClick: startMistakeReview },
            ]
            : [{ label: 'OK', variant: 'primary', onClick: exitQuiz }];

        showModal({
            title: 'Quiz finalizado!',
            content: {
                kind: 'summary',
                elapsed: getElapsedTimeText(startTime.value),
                hits: hits.value,
                misses: miss.value,
                mastery: mastery ? { mastered: mastery.mastered, total: mastery.total } : null,
                reviewItems,
                confusions,
            },
            buttons,
            dismissible: false,
        });
    }

    function startMistakeReview() {
        const reviewChars = selectedCharsSession.value.filter((char) => {
            return (sessionKanaStats.value[char.char]?.miss ?? 0) > 0;
        });
        if (reviewChars.length === 0) {
            exitQuiz();
            return;
        }

        resetSessionState();
        activeQuizMode.value = 'normal';
        repetitionsPerChar.value = 1;
        selectedCharsSession.value = reviewChars;
        quizList.value = createStandardQuizList(reviewChars, 1, 'normal');
        quizStarted.value = true;
        startRoundWithCountdown();
    }

    function exitQuiz() {
        resetSessionState();
        quizStarted.value = false;
        questionVisible.value = false;
    }

    function confirmExitQuiz() {
        showModal({
            title: 'Sair do quiz?',
            content: { kind: 'text', text: 'Tem certeza que deseja sair? Seu progresso da sess\u00E3o ser\u00E1 perdido.' },
            buttons: [
                { label: 'Cancelar', variant: 'secondary' },
                { label: 'Sair', variant: 'primary', onClick: exitQuiz },
            ],
            dismissible: true,
        });
    }

    function confirmRestartQuiz() {
        showModal({
            title: 'Reiniciar quiz?',
            content: { kind: 'text', text: 'Deseja reiniciar com as mesmas configura\u00E7\u00F5es atuais?' },
            buttons: [
                { label: 'Cancelar', variant: 'secondary' },
                { label: 'Reiniciar', variant: 'primary', onClick: startQuiz },
            ],
            dismissible: true,
        });
    }

    function startQuiz() {
        resetSessionState();

        const selectedQuizMode = quizType.value;
        activeQuizMode.value = selectedQuizMode;
        repetitionsPerChar.value = Math.max(1, Math.min(10, Number(repeat.value) || 1));
        selectedCharsSession.value = selectedCharIds.value
            .map((index) => allChars[index])
            .filter((char): char is KanaChar => Boolean(char));

        if (selectedCharsSession.value.length === 0) {
            showModal({
                title: 'Aten\u00E7\u00E3o',
                content: { kind: 'text', text: 'Selecione pelo menos um caractere para come\u00E7ar.' },
                buttons: [{ label: 'OK', variant: 'primary' }],
                dismissible: true,
            });
            return;
        }

        if (selectedQuizMode === 'combo') {
            quizList.value = createComboQuizList(selectedCharsSession.value, repetitionsPerChar.value);
        } else if (selectedQuizMode === 'study') {
            studySession.value = createStudySession(selectedCharsSession.value);
        } else {
            quizList.value = createStandardQuizList(
                selectedCharsSession.value,
                repetitionsPerChar.value,
                selectedQuizMode,
            );
        }

        if (selectedQuizMode === 'combo' && quizList.value.length === 0) {
            showModal({
                title: 'Aten\u00E7\u00E3o',
                content: {
                    kind: 'text',
                    text: 'N\u00E3o h\u00E1 caracteres suficientes para criar combos. Selecione pelo menos 3.',
                },
                buttons: [{ label: 'OK', variant: 'primary' }],
                dismissible: true,
            });
            return;
        }

        quizStarted.value = true;
        startRoundWithCountdown();
    }

    function getReverseOptionState(option: KanaChar) {
        if (!reverseLocked.value) return '';
        if (option.char === currentKana.value?.char) return 'correct';
        if (option.char === reverseSelectedChar.value) return 'wrong';
        return 'disabled';
    }

    const scoreContext = { getKanaStats, getSessionKanaStats, hits, miss, persistStats, showFeedback };
    const navigationContext = { scheduleTask, showNextQuestion };

    const submitAnswer = createNormalAnswerHandler({
        ...scoreContext,
        ...navigationContext,
        answer: normalAnswer,
        answerState: normalAnswerState,
        currentIndex,
        currentKana,
        quizList,
    });
    const submitComboAnswer = createComboAnswerHandler({
        ...scoreContext,
        ...navigationContext,
        answer: comboAnswer,
        answerState: comboAnswerState,
        currentCombo,
        currentIndex,
        quizList,
    });
    const checkReverseAnswer = createReverseAnswerHandler({
        ...scoreContext,
        ...navigationContext,
        currentIndex,
        currentKana,
        locked: reverseLocked,
        quizList,
        selectedChar: reverseSelectedChar,
    });
    const { getOptionState: getStudyOptionState, selectOption: handleStudyOption } = createStudyAnswerHandlers({
        ...scoreContext,
        ...navigationContext,
        answered: studyAnswered,
        currentKana,
        phase: studyPhase,
        selectedOption: studySelectedOption,
        acknowledgeCard: (char) => {
            studySession.value = acknowledgeStudyCard(requireStudySession(), char);
        },
        answerCard: (char, selectedRomaji, isCorrect) => {
            studySession.value = answerStudyCard(requireStudySession(), char, selectedRomaji, isCorrect);
        },
    });

    return {
        activeQuizMode,
        checkReverseAnswer,
        comboAnswer,
        comboAnswerState,
        comboAnswerRef,
        confirmExitQuiz,
        confirmRestartQuiz,
        currentCharText,
        currentCombo,
        currentRomajiText,
        dismissModal,
        feedback,
        getReverseOptionState,
        getStudyOptionState,
        handleModalAction,
        handleStudyOption,
        isDark,
        modal,
        mode,
        normalAnswer,
        normalAnswerState,
        normalAnswerRef,
        progressText,
        questionVisible,
        quizStarted,
        quizType,
        repeat,
        reverseLocked,
        reverseOptions,
        sections,
        selectedCharIds,
        setSectionSelection,
        startQuiz,
        studyOptions,
        studyPhase,
        studyTeachingPrefix,
        studyTeachingTone,
        studyTeachingValue,
        submitAnswer,
        submitComboAnswer,
        timerText,
        toggleTheme,
    };
}
