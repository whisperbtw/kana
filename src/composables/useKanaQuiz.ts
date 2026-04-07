import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { allChars, type KanaChar } from '~/data/chars';
import { XP_REWARD, getSectionsForMode } from './kanaQuiz/core/constants';
import { createDefaultProfile, getRankByLevel, getXpRequiredForLevel } from './kanaQuiz/profile/profile';
import type {
    KanaMode,
    KanaStats,
    Profile,
    QuizEntry,
    QuizMode,
    StudyCharStat,
    StudyPhase,
    TeachingTone,
    ThemeMode,
} from './kanaQuiz/core/types';
import { shuffle } from './kanaQuiz/shared/utils';
import {
    buildReverseOptions as createReverseOptions,
    buildStudyOptions as createStudyOptions,
    createComboQuizList,
    createStandardQuizList,
    createStudyModeData,
} from './kanaQuiz/flow/modes';
import {
    loadStoredProfile,
    loadStoredStats,
    loadStoredTheme,
    saveStoredProfile,
    saveStoredStats,
    saveStoredTheme,
} from './kanaQuiz/persistence/storage';
import { getElapsedTimeText } from './kanaQuiz/flow/timer';
import {
    createStudyQuestionState,
    getStudyProgress,
    isStudyComplete,
    unlockNextStudyCharIfNeeded as getUnlockedStudyPool,
} from './kanaQuiz/study/study';
import { useKanaQuizRuntime } from './kanaQuiz/flow/runtime';
import { createKanaQuizAnswerHandlers } from './kanaQuiz/flow/answerHandlers';

export type {
    IndexedKanaChar,
    KanaMode,
    ModalButton,
    Profile,
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

    const profile = ref<Profile>(createDefaultProfile());
    const sessionXpGained = ref(0);

    const hits = ref(0);
    const miss = ref(0);
    const perKana = ref<Record<string, KanaStats>>({});

    const quizStarted = ref(false);
    const questionVisible = ref(false);
    const activeQuizMode = ref<QuizMode>('normal');
    const quizList = ref<QuizEntry[]>([]);
    const currentIndex = ref(0);
    const progressText = ref('');

    const normalAnswer = ref('');
    const comboAnswer = ref('');
    const normalInputDisabled = ref(false);
    const comboInputDisabled = ref(false);
    const normalInputError = ref(false);
    const comboInputError = ref(false);

    const reverseOptions = ref<KanaChar[]>([]);
    const reverseLocked = ref(false);
    const reverseSelectedChar = ref<string | null>(null);

    const studyCharStats = ref<Record<string, StudyCharStat>>({});
    const studyOrder = ref<KanaChar[]>([]);
    const activeCharPool = ref<KanaChar[]>([]);
    const repetitionsPerChar = ref(0);
    const blockTeachingPhase = ref(true);
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
        feedbackIcon,
        feedbackVisible,
        handleModalAction,
        modalButtons,
        modalContent,
        modalOpen,
        modalTitle,
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
    const profileXpRequired = computed(() => getXpRequiredForLevel(profile.value.level));
    const profileProgress = computed(() => {
        return Math.max(0, Math.min(100, Math.round((profile.value.xp / profileXpRequired.value) * 100)));
    });

    const sections = computed(() => getSectionsForMode(mode.value));

    const currentEntry = computed(() => quizList.value[currentIndex.value] ?? null);
    const currentKana = computed<KanaChar | null>(() => {
        const entry = currentEntry.value;
        return entry && !Array.isArray(entry) ? entry : null;
    });
    const currentCombo = computed<KanaChar[]>(() => {
        const entry = currentEntry.value;
        return Array.isArray(entry) ? entry : [];
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
    });

    onBeforeUnmount(() => {
        cleanupRuntime();
    });

    function hydrateStoredState() {
        const savedTheme = loadStoredTheme();

        if (savedTheme) {
            theme.value = savedTheme;
        }

        perKana.value = loadStoredStats().perKana;
        profile.value = loadStoredProfile();
    }

    function persistStats() {
        if (!import.meta.client) return;

        saveStoredStats({
            hits: hits.value,
            miss: miss.value,
            perKana: perKana.value,
        });
    }

    function persistProfile() {
        if (!import.meta.client) return;
        saveStoredProfile(profile.value);
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
        normalInputDisabled.value = false;
        comboInputDisabled.value = false;
        normalInputError.value = false;
        comboInputError.value = false;
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
        sessionXpGained.value = 0;
        currentIndex.value = 0;
        progressText.value = '';
        quizList.value = [];
        selectedCharsSession.value = [];
        activeCharPool.value = [];
        studyOrder.value = [];
        repetitionsPerChar.value = 0;
        blockTeachingPhase.value = true;
        studyCharStats.value = {};
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

    function getStudyStats(char: string) {
        const stats = studyCharStats.value[char];

        if (!stats) {
            throw new Error(`Study stats missing for character "${char}"`);
        }

        return stats;
    }

    function addXp(amount: number) {
        if (!Number.isFinite(amount) || amount <= 0) return;

        sessionXpGained.value += amount;
        profile.value.totalXp += amount;
        profile.value.xp += amount;

        while (profile.value.xp >= getXpRequiredForLevel(profile.value.level)) {
            profile.value.xp -= getXpRequiredForLevel(profile.value.level);
            profile.value.level += 1;
        }

        profile.value.rank = getRankByLevel(profile.value.level);
        profile.value.updatedAt = Date.now();
        persistProfile();
    }

    function buildReverseOptions(current: KanaChar) {
        reverseOptions.value = createReverseOptions(current, selectedCharsSession.value);
        reverseLocked.value = false;
        reverseSelectedChar.value = null;
    }

    function buildStudyOptions(current: KanaChar) {
        return createStudyOptions(current, selectedCharsSession.value);
    }

    function refreshStudyQuizList() {
        currentIndex.value = 0;
        quizList.value = shuffle([...activeCharPool.value]);
    }

    function unlockNextStudyCharIfNeeded() {
        activeCharPool.value = getUnlockedStudyPool({
            blockTeachingPhase: blockTeachingPhase.value,
            studyOrder: studyOrder.value,
            activeCharPool: activeCharPool.value,
            studyCharStats: studyCharStats.value,
            repetitionsPerChar: repetitionsPerChar.value,
        });
    }

    function showStudyQuestion() {
        const current = currentKana.value;
        if (!current) return;

        const stats = getStudyStats(current.char);
        const progress = getStudyProgress(selectedCharsSession.value, studyCharStats.value, repetitionsPerChar.value);
        const nextQuestionState = createStudyQuestionState({
            current,
            stats,
            options: stats.firstTime ? ['Entendi'] : buildStudyOptions(current),
        });

        progressText.value = `${progress.completed} de ${progress.total}`;
        studyAnswered.value = false;
        studySelectedOption.value = null;
        studyPhase.value = nextQuestionState.phase;
        studyTeachingPrefix.value = nextQuestionState.prefix;
        studyTeachingValue.value = nextQuestionState.value;
        studyTeachingTone.value = nextQuestionState.tone;
        studyOptions.value = nextQuestionState.options;
    }

    function showNextQuestion() {
        if (activeQuizMode.value === 'study') {
            const teachingComplete = activeCharPool.value.every((char) => !studyCharStats.value[char.char]?.firstTime);
            if (blockTeachingPhase.value && teachingComplete) {
                blockTeachingPhase.value = false;
                refreshStudyQuizList();
            }

            if (isStudyComplete(selectedCharsSession.value, studyCharStats.value, repetitionsPerChar.value)) {
                finishQuiz();
                return;
            }
        }

        if (currentIndex.value >= quizList.value.length) {
            finishQuiz();
            return;
        }

        questionVisible.value = true;

        if (activeQuizMode.value === 'study') {
            showStudyQuestion();
            return;
        }

        progressText.value = `Quest\u00E3o ${currentIndex.value + 1} de ${quizList.value.length}`;

        if (activeQuizMode.value === 'normal') {
            normalAnswer.value = '';
            normalInputDisabled.value = false;
            normalInputError.value = false;
            nextTick(() => normalAnswerRef.value?.focus());
            return;
        }

        if (activeQuizMode.value === 'combo') {
            comboAnswer.value = '';
            comboInputDisabled.value = false;
            comboInputError.value = false;
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

        showModal(
            'Quiz finalizado!',
            `
        <div class="stat-line">Tempo: ${getElapsedTimeText(startTime.value)}</div>
        <div class="stat-line">Acertos: ${hits.value}</div>
        <div class="stat-line">Erros: ${miss.value}</div>
        <div class="stat-line">XP ganho: ${sessionXpGained.value}</div>
        <div class="stat-line">N\u00EDvel: ${profile.value.level} (${profile.value.rank})</div>
      `,
            [{ text: 'OK', type: 'primary', onClick: exitQuiz }],
        );
    }

    function exitQuiz() {
        resetSessionState();
        quizStarted.value = false;
        questionVisible.value = false;
    }

    function confirmExitQuiz() {
        showModal('Sair do quiz?', 'Tem certeza que deseja sair? Seu progresso da sess\u00E3o ser\u00E1 perdido.', [
            { text: 'Cancelar', type: 'secondary' },
            { text: 'Sair', type: 'primary', onClick: exitQuiz },
        ]);
    }

    function confirmRestartQuiz() {
        showModal('Reiniciar quiz?', 'Deseja reiniciar com as mesmas configura\u00E7\u00F5es atuais?', [
            { text: 'Cancelar', type: 'secondary' },
            { text: 'Reiniciar', type: 'primary', onClick: startQuiz },
        ]);
    }

    function startQuiz() {
        resetSessionState();

        activeQuizMode.value = quizType.value;
        repetitionsPerChar.value = Math.max(1, Math.min(10, Number(repeat.value) || 1));
        selectedCharsSession.value = selectedCharIds.value
            .map((index) => allChars[index])
            .filter((char): char is KanaChar => Boolean(char));

        if (selectedCharsSession.value.length === 0) {
            showModal('Aten\u00E7\u00E3o', 'Selecione pelo menos um caractere para come\u00E7ar.', [
                { text: 'OK', type: 'primary' },
            ]);
            return;
        }

        if (activeQuizMode.value === 'combo') {
            quizList.value = createComboQuizList(selectedCharsSession.value, repetitionsPerChar.value);
        } else if (activeQuizMode.value === 'study') {
            const studyModeData = createStudyModeData(selectedCharsSession.value);
            studyCharStats.value = studyModeData.stats;
            studyOrder.value = studyModeData.studyOrder;
            activeCharPool.value = studyModeData.activeCharPool;
            quizList.value = studyModeData.quizList;
            blockTeachingPhase.value = true;
        } else {
            quizList.value = createStandardQuizList(selectedCharsSession.value, repetitionsPerChar.value);
        }

        if (quizList.value.length === 0) {
            showModal(
                'Aten\u00E7\u00E3o',
                'N\u00E3o h\u00E1 caracteres suficientes para criar combos. Selecione pelo menos 3.',
                [{ text: 'OK', type: 'primary' }],
            );
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

    const { checkReverseAnswer, getStudyOptionState, handleStudyOption, submitAnswer, submitComboAnswer } =
        createKanaQuizAnswerHandlers({
            addXp,
            activeCharPool,
            comboAnswer,
            comboInputDisabled,
            comboInputError,
            currentCombo,
            currentIndex,
            currentKana,
            ensureKanaStats,
            getKanaStats,
            getStudyStats,
            hits,
            isStudyComplete: () =>
                isStudyComplete(selectedCharsSession.value, studyCharStats.value, repetitionsPerChar.value),
            miss,
            normalAnswer,
            normalInputDisabled,
            normalInputError,
            persistStats,
            quizList,
            refreshStudyQuizList,
            repetitionsPerChar,
            reverseLocked,
            reverseSelectedChar,
            scheduleTask,
            selectedCharsSession,
            showFeedback,
            showNextQuestion,
            studyAnswered,
            studyCharStats,
            studyPhase,
            studySelectedOption,
            unlockNextStudyCharIfNeeded,
        });

    return {
        activeQuizMode,
        checkReverseAnswer,
        comboAnswer,
        comboAnswerRef,
        comboInputDisabled,
        comboInputError,
        confirmExitQuiz,
        confirmRestartQuiz,
        currentCharText,
        currentCombo,
        currentRomajiText,
        feedbackIcon,
        feedbackVisible,
        getReverseOptionState,
        getStudyOptionState,
        handleModalAction,
        handleStudyOption,
        isDark,
        modalButtons,
        modalContent,
        modalOpen,
        modalTitle,
        mode,
        normalAnswer,
        normalAnswerRef,
        normalInputDisabled,
        normalInputError,
        profile,
        profileProgress,
        profileXpRequired,
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
