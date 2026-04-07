import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { allChars, type KanaChar } from '~/data/chars';

type StudyCharStat = {
    correct: number;
    incorrect: number;
    firstTime: boolean;
    teach: boolean;
};

type KanaMode = 'all' | 'hira' | 'kata';
type QuizMode = 'normal' | 'reverse' | 'combo' | 'study';
type StudyPhase = 'first' | 'practice' | 'relearn';
type ThemeMode = 'light' | 'dark';
type QuizEntry = KanaChar | KanaChar[];
type TeachingTone = 'primary' | 'success';

type KanaStats = {
    hits: number;
    miss: number;
};

type ModalButton = {
    text: string;
    type?: 'primary' | 'secondary';
    onClick?: () => void;
};

type Profile = {
    version: number;
    level: number;
    xp: number;
    totalXp: number;
    rank: string;
    updatedAt: number;
};

const THEME_STORAGE_KEY = 'kanaTheme';
const STATS_STORAGE_KEY = 'kanaStats';
const PROFILE_STORAGE_KEY = 'kanaProfileV1';

const XP_REWARD = Object.freeze({
    normal: 10,
    reverse: 10,
    combo: 16,
    study: 12,
});

const SECTION_DEFINITIONS = [
    {
        title: 'Hiragana Básico',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'basic',
    },
    {
        title: 'Hiragana Dakuten (゛)',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'dakuten',
    },
    {
        title: 'Hiragana Handakuten (゜)',
        filter: (char: KanaChar) => char.type === 'hira' && char.group === 'handakuten',
    },
    {
        title: 'Katakana Básico',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'basic',
    },
    {
        title: 'Katakana Dakuten (゛)',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'dakuten',
    },
    {
        title: 'Katakana Handakuten (゜)',
        filter: (char: KanaChar) => char.type === 'kata' && char.group === 'handakuten',
    },
] as const;

function shuffle<T>(items: T[]) {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const currentItem = items[index];
        const randomItem = items[randomIndex];

        if (currentItem === undefined || randomItem === undefined) {
            continue;
        }

        items[index] = randomItem;
        items[randomIndex] = currentItem;
    }

    return items;
}

function getXpRequiredForLevel(level: number) {
    return 80 + (level - 1) * 35;
}

function getRankByLevel(level: number) {
    if (level >= 35) return 'Master';
    if (level >= 25) return 'Diamond';
    if (level >= 15) return 'Gold';
    if (level >= 8) return 'Silver';
    return 'Bronze';
}

function createDefaultProfile(): Profile {
    return {
        version: 1,
        level: 1,
        xp: 0,
        totalXp: 0,
        rank: getRankByLevel(1),
        updatedAt: Date.now(),
    };
}

function normalizeProfile(rawProfile: Partial<Profile>): Profile {
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

function createDefaultStats() {
    return {
        hits: 0,
        miss: 0,
        perKana: {} as Record<string, KanaStats>,
    };
}

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
    const timerText = ref('⏱️ 00:00');
    const startTime = ref<number | null>(null);

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

    const feedbackVisible = ref(false);
    const feedbackIcon = ref('');

    const modalOpen = ref(false);
    const modalTitle = ref('');
    const modalContent = ref('');
    const modalButtons = ref<ModalButton[]>([]);

    const normalAnswerRef = ref<HTMLInputElement | null>(null);
    const comboAnswerRef = ref<HTMLInputElement | null>(null);

    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let preStartCountdownInterval: ReturnType<typeof setInterval> | null = null;
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
    let hasHydrated = false;

    const isDark = computed(() => theme.value === 'dark');
    const selectedIdSet = computed(() => new Set(selectedCharIds.value));
    const profileXpRequired = computed(() => getXpRequiredForLevel(profile.value.level));
    const profileProgress = computed(() => {
        return Math.max(0, Math.min(100, Math.round((profile.value.xp / profileXpRequired.value) * 100)));
    });

    const allCharsWithIndex = allChars.map((char, index) => ({ ...char, index }));

    const sections = computed(() => {
        return SECTION_DEFINITIONS.map((section) => {
            const chars = allCharsWithIndex.filter((char) => {
                if (mode.value === 'hira' && char.type !== 'hira') return false;
                if (mode.value === 'kata' && char.type !== 'kata') return false;
                return section.filter(char);
            });

            return {
                title: section.title,
                chars,
            };
        }).filter((section) => section.chars.length > 0);
    });

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
        localStorage.setItem(THEME_STORAGE_KEY, value);
    });

    onMounted(() => {
        hydrateStoredState();
        hasHydrated = true;
        document.body.classList.toggle('dark', isDark.value);
    });

    onBeforeUnmount(() => {
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();
    });

    function hydrateStoredState() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
            theme.value = savedTheme;
        }

        const rawStats = localStorage.getItem(STATS_STORAGE_KEY);
        if (rawStats) {
            try {
                const parsed = JSON.parse(rawStats) as ReturnType<typeof createDefaultStats>;
                perKana.value = parsed.perKana || {};
            } catch {
                perKana.value = {};
            }
        }

        const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (rawProfile) {
            try {
                profile.value = normalizeProfile(JSON.parse(rawProfile) as Partial<Profile>);
            } catch {
                profile.value = createDefaultProfile();
            }
        } else {
            profile.value = createDefaultProfile();
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile.value));
        }
    }

    function persistStats() {
        if (!import.meta.client) return;

        localStorage.setItem(
            STATS_STORAGE_KEY,
            JSON.stringify({
                hits: hits.value,
                miss: miss.value,
                perKana: perKana.value,
            }),
        );
    }

    function persistProfile() {
        if (!import.meta.client) return;
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile.value));
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

    function getElapsedTimeText() {
        if (!startTime.value) return '0min 0s';

        const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}min ${seconds}s`;
    }

    function updateTimer() {
        if (!startTime.value) {
            timerText.value = '⏱️ 00:00';
            return;
        }

        const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerText.value = `⏱️ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function stopTimer() {
        if (!timerInterval) return;
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function stopPreStartCountdown() {
        if (!preStartCountdownInterval) return;
        clearInterval(preStartCountdownInterval);
        preStartCountdownInterval = null;
    }

    function scheduleTask(callback: () => void, delayMs: number) {
        const timeoutId = setTimeout(() => {
            pendingTimeouts.delete(timeoutId);
            callback();
        }, delayMs);

        pendingTimeouts.add(timeoutId);
    }

    function clearPendingTimeouts() {
        for (const timeoutId of pendingTimeouts) {
            clearTimeout(timeoutId);
        }

        pendingTimeouts.clear();
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
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();
        hits.value = 0;
        miss.value = 0;
        sessionXpGained.value = 0;
        currentIndex.value = 0;
        startTime.value = null;
        progressText.value = '';
        timerText.value = '⏱️ 00:00';
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

    function showModal(title: string, content: string, buttons: ModalButton[]) {
        modalTitle.value = title;
        modalContent.value = content;
        modalButtons.value = buttons;
        modalOpen.value = true;
    }

    function handleModalAction(button: ModalButton) {
        modalOpen.value = false;
        modalTitle.value = '';
        modalContent.value = '';
        modalButtons.value = [];

        if (button.text !== 'dismiss') {
            button.onClick?.();
        }
    }

    function showFeedback(isCorrect: boolean) {
        feedbackIcon.value = isCorrect ? '✅' : '❌';
        feedbackVisible.value = true;

        scheduleTask(() => {
            feedbackVisible.value = false;
        }, 500);
    }

    function buildReverseOptions(current: KanaChar) {
        const wrongOptions: KanaChar[] = [];
        const availableChars = selectedCharsSession.value.filter((char) => char.char !== current.char);

        while (wrongOptions.length < 2 && availableChars.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableChars.length);
            const wrongChar = availableChars[randomIndex];

            if (!wrongChar) {
                break;
            }

            if (!wrongOptions.find((char) => char.char === wrongChar.char) && wrongChar.romaji !== current.romaji) {
                wrongOptions.push(wrongChar);
            }

            availableChars.splice(randomIndex, 1);
        }

        reverseOptions.value = shuffle([current, ...wrongOptions]);
        reverseLocked.value = false;
        reverseSelectedChar.value = null;
    }

    function getStudyProgress() {
        const completed = selectedCharsSession.value.filter((char) => {
            return (studyCharStats.value[char.char]?.correct ?? 0) >= repetitionsPerChar.value;
        }).length;

        return {
            completed,
            total: selectedCharsSession.value.length,
        };
    }

    function isStudyComplete() {
        return selectedCharsSession.value.every((char) => {
            return (studyCharStats.value[char.char]?.correct ?? 0) >= repetitionsPerChar.value;
        });
    }

    function buildStudyOptions(current: KanaChar) {
        const wrongOptions: KanaChar[] = [];
        const availableChars = selectedCharsSession.value.filter((char) => char.char !== current.char);

        while (wrongOptions.length < 3 && availableChars.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableChars.length);
            const wrongChar = availableChars[randomIndex];

            if (!wrongChar) {
                break;
            }

            if (!wrongOptions.find((char) => char.romaji === wrongChar.romaji) && wrongChar.romaji !== current.romaji) {
                wrongOptions.push(wrongChar);
            }

            availableChars.splice(randomIndex, 1);
        }

        while (wrongOptions.length < 3 && availableChars.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableChars.length);
            const wrongChar = availableChars[randomIndex];

            if (!wrongChar) {
                break;
            }

            wrongOptions.push(wrongChar);
            availableChars.splice(randomIndex, 1);
        }

        return shuffle([current.romaji, ...wrongOptions.map((char) => char.romaji)]);
    }

    function refreshStudyQuizList() {
        currentIndex.value = 0;
        quizList.value = shuffle([...activeCharPool.value]);
    }

    function unlockNextStudyCharIfNeeded() {
        if (blockTeachingPhase.value) return;

        const nextChar = studyOrder.value.find((char) => {
            return (
                !activeCharPool.value.some((activeChar) => activeChar.char === char.char) &&
                (studyCharStats.value[char.char]?.correct ?? 0) < repetitionsPerChar.value
            );
        });

        if (nextChar) {
            activeCharPool.value = [...activeCharPool.value, nextChar];
        }
    }

    function showStudyTeachFirst(current: KanaChar) {
        studyPhase.value = 'first';
        studyTeachingPrefix.value = 'Aprenda:';
        studyTeachingValue.value = current.romaji;
        studyTeachingTone.value = 'primary';
        studyOptions.value = ['Entendi'];
    }

    function showStudyPractice(current: KanaChar) {
        studyPhase.value = 'practice';
        studyTeachingPrefix.value = 'Prática';
        studyTeachingValue.value = '';
        studyTeachingTone.value = 'primary';
        studyOptions.value = buildStudyOptions(current);
    }

    function showStudyTeachAgain(current: KanaChar) {
        studyPhase.value = 'relearn';
        studyTeachingPrefix.value = 'Reaprendendo:';
        studyTeachingValue.value = current.romaji;
        studyTeachingTone.value = 'success';
        studyOptions.value = buildStudyOptions(current);
    }

    function showStudyQuestion() {
        const current = currentKana.value;
        if (!current) return;

        const stats = getStudyStats(current.char);
        const progress = getStudyProgress();

        progressText.value = `${progress.completed} de ${progress.total}`;
        studyAnswered.value = false;
        studySelectedOption.value = null;

        if (stats.firstTime) {
            showStudyTeachFirst(current);
            return;
        }

        if (stats.teach) {
            showStudyTeachAgain(current);
            return;
        }

        showStudyPractice(current);
    }

    function showNextQuestion() {
        if (activeQuizMode.value === 'study') {
            const teachingComplete = activeCharPool.value.every((char) => !studyCharStats.value[char.char]?.firstTime);
            if (blockTeachingPhase.value && teachingComplete) {
                blockTeachingPhase.value = false;
                refreshStudyQuizList();
            }

            if (isStudyComplete()) {
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

        progressText.value = `Questão ${currentIndex.value + 1} de ${quizList.value.length}`;

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
        stopTimer();
        stopPreStartCountdown();
        questionVisible.value = false;
        progressText.value = 'Prepare-se...';

        let remainingSeconds = 3;
        timerText.value = `⏳ ${remainingSeconds}s`;

        preStartCountdownInterval = setInterval(() => {
            remainingSeconds -= 1;

            if (remainingSeconds <= 0) {
                stopPreStartCountdown();
                startTime.value = Date.now();
                updateTimer();
                timerInterval = setInterval(updateTimer, 1000);
                showNextQuestion();
                return;
            }

            timerText.value = `⏳ ${remainingSeconds}s`;
        }, 1000);
    }

    function finishQuiz() {
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();

        showModal(
            'Quiz finalizado!',
            `
        <div class="stat-line">Tempo: ${getElapsedTimeText()}</div>
        <div class="stat-line">Acertos: ${hits.value}</div>
        <div class="stat-line">Erros: ${miss.value}</div>
        <div class="stat-line">XP ganho: ${sessionXpGained.value}</div>
        <div class="stat-line">Nível: ${profile.value.level} (${profile.value.rank})</div>
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
        showModal('Sair do quiz?', 'Tem certeza que deseja sair? Seu progresso da sessão será perdido.', [
            { text: 'Cancelar', type: 'secondary' },
            { text: 'Sair', type: 'primary', onClick: exitQuiz },
        ]);
    }

    function confirmRestartQuiz() {
        showModal('Reiniciar quiz?', 'Deseja reiniciar com as mesmas configurações atuais?', [
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
            showModal('Atenção', 'Selecione pelo menos um caractere para começar.', [{ text: 'OK', type: 'primary' }]);
            return;
        }

        if (activeQuizMode.value === 'combo') {
            for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar.value; repetitionIndex += 1) {
                const shuffledChars = shuffle([...selectedCharsSession.value]);

                for (let comboIndex = 0; comboIndex < shuffledChars.length; comboIndex += 3) {
                    const combo = shuffledChars.slice(comboIndex, comboIndex + 3);
                    if (combo.length === 3) {
                        quizList.value.push(combo);
                    }
                }
            }
        } else if (activeQuizMode.value === 'study') {
            const stats: Record<string, StudyCharStat> = {};

            for (const char of selectedCharsSession.value) {
                stats[char.char] = {
                    correct: 0,
                    incorrect: 0,
                    firstTime: true,
                    teach: false,
                };
            }

            studyCharStats.value = stats;
            studyOrder.value = shuffle([...selectedCharsSession.value]);
            activeCharPool.value = studyOrder.value.slice(0, 4);
            quizList.value = shuffle([...activeCharPool.value]);
            blockTeachingPhase.value = true;
        } else {
            for (const char of selectedCharsSession.value) {
                for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar.value; repetitionIndex += 1) {
                    quizList.value.push(char);
                }
            }

            quizList.value = shuffle(quizList.value);
        }

        if (quizList.value.length === 0) {
            showModal('Atenção', 'Não há caracteres suficientes para criar combos. Selecione pelo menos 3.', [
                { text: 'OK', type: 'primary' },
            ]);
            return;
        }

        quizStarted.value = true;
        startRoundWithCountdown();
    }

    function submitAnswer() {
        const current = currentKana.value;
        const input = normalAnswer.value.trim().toLowerCase();

        if (!current || normalInputDisabled.value || !input) return;

        ensureKanaStats(current.char);

        if (input === current.romaji) {
            hits.value += 1;
            getKanaStats(current.char).hits += 1;
            addXp(XP_REWARD.normal);
            showFeedback(true);
            persistStats();
            currentIndex.value += 1;
            scheduleTask(showNextQuestion, 300);
            return;
        }

        miss.value += 1;
        getKanaStats(current.char).miss += 1;
        normalAnswer.value = current.romaji;
        normalInputDisabled.value = true;
        normalInputError.value = true;
        showFeedback(false);
        persistStats();
        quizList.value.push(current);

        scheduleTask(() => {
            normalInputDisabled.value = false;
            normalInputError.value = false;
            currentIndex.value += 1;
            showNextQuestion();
        }, 2000);
    }

    function submitComboAnswer() {
        const combo = currentCombo.value;
        const input = comboAnswer.value.trim().toLowerCase();

        if (!combo.length || comboInputDisabled.value || !input) return;

        const correctAnswer = combo.map((char) => char.romaji).join('');

        for (const char of combo) {
            ensureKanaStats(char.char);
        }

        if (input === correctAnswer) {
            hits.value += 1;
            for (const char of combo) {
                getKanaStats(char.char).hits += 1;
            }
            addXp(XP_REWARD.combo);
            showFeedback(true);
            persistStats();
            currentIndex.value += 1;
            scheduleTask(showNextQuestion, 300);
            return;
        }

        miss.value += 1;
        for (const char of combo) {
            getKanaStats(char.char).miss += 1;
        }

        comboAnswer.value = correctAnswer;
        comboInputDisabled.value = true;
        comboInputError.value = true;
        showFeedback(false);
        persistStats();
        quizList.value.push([...combo]);

        scheduleTask(() => {
            comboInputDisabled.value = false;
            comboInputError.value = false;
            currentIndex.value += 1;
            showNextQuestion();
        }, 2000);
    }

    function getReverseOptionState(option: KanaChar) {
        if (!reverseLocked.value) return '';
        if (option.char === currentKana.value?.char) return 'correct';
        if (option.char === reverseSelectedChar.value) return 'wrong';
        return 'disabled';
    }

    function checkReverseAnswer(option: KanaChar) {
        const current = currentKana.value;
        if (!current || reverseLocked.value) return;

        reverseLocked.value = true;
        reverseSelectedChar.value = option.char;
        ensureKanaStats(current.char);

        if (option.char === current.char) {
            hits.value += 1;
            getKanaStats(current.char).hits += 1;
            addXp(XP_REWARD.reverse);
            showFeedback(true);
            persistStats();
            currentIndex.value += 1;
            scheduleTask(showNextQuestion, 800);
            return;
        }

        miss.value += 1;
        getKanaStats(current.char).miss += 1;
        showFeedback(false);
        persistStats();
        quizList.value.push(current);

        scheduleTask(() => {
            currentIndex.value += 1;
            showNextQuestion();
        }, 2000);
    }

    function markFirstTimeAndContinue() {
        const current = currentKana.value;
        if (!current) return;

        getStudyStats(current.char).firstTime = false;
        showFeedback(true);
        currentIndex.value += 1;
        scheduleTask(showNextQuestion, 600);
    }

    function getStudyOptionState(option: string) {
        if (studyPhase.value === 'first' || !studyAnswered.value) return '';
        if (option === currentKana.value?.romaji) return 'correct';
        if (option === studySelectedOption.value) return 'wrong';
        return 'disabled';
    }

    function handleStudyOption(option: string) {
        const current = currentKana.value;
        if (!current || studyAnswered.value) return;

        if (studyPhase.value === 'first') {
            markFirstTimeAndContinue();
            return;
        }

        const stats = getStudyStats(current.char);
        studyAnswered.value = true;
        studySelectedOption.value = option;
        ensureKanaStats(current.char);

        if (option === current.romaji) {
            hits.value += 1;
            getKanaStats(current.char).hits += 1;
            addXp(XP_REWARD.study);
            stats.correct += 1;
            stats.incorrect = 0;
            stats.teach = false;
            showFeedback(true);
            persistStats();

            if (isStudyComplete()) {
                scheduleTask(showNextQuestion, 800);
                return;
            }

            if (stats.correct >= repetitionsPerChar.value) {
                activeCharPool.value = activeCharPool.value.filter((char) => char.char !== current.char);
                unlockNextStudyCharIfNeeded();
            }

            if (activeCharPool.value.length > 0) {
                refreshStudyQuizList();
            } else {
                quizList.value = [];
            }

            scheduleTask(showNextQuestion, 800);
            return;
        }

        miss.value += 1;
        getKanaStats(current.char).miss += 1;
        stats.incorrect += 1;
        if (stats.incorrect >= 2) {
            stats.teach = true;
        }
        showFeedback(false);
        persistStats();

        scheduleTask(() => {
            refreshStudyQuizList();
            showNextQuestion();
        }, 1500);
    }

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
        selectedIdSet,
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
