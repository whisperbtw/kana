import { allChars } from '../data/chars.js';

// Estado
const savedStats = JSON.parse(localStorage.getItem('kanaStats') || '{"hits":0,"miss":0,"perKana":{}}');
let hits = savedStats.hits || 0;
let miss = savedStats.miss || 0;
let perKana = savedStats.perKana || {};
let quizList = [];
let currentIndex = 0;
let startTime = null;
let timerInterval = null;
let sessionXpGained = 0;

// Variáveis para modo estudo
let studyCharStats = {}; // Rastrear acertos/erros por caractere no modo estudo
let studyBlocks = []; // Blocos de 4 caracteres
let repetitionsPerChar = 0; // Número de vezes que cada caractere precisa ser acertado
let blockTeachingPhase = true; // Flag para fase de ensinamento do bloco
let activeCharPool = []; // Pool de caracteres ativos (em aprendizado/prática)

// Perfil local (nivel/xp/rank)
const PROFILE_STORAGE_KEY = 'kanaProfileV1';
const XP_REWARD = Object.freeze({
    normal: 10,
    reverse: 10,
    combo: 16,
    study: 12,
});

function getXpRequiredForLevel(level) {
    return 80 + (level - 1) * 35;
}

function getRankByLevel(level) {
    if (level >= 35) return 'Master';
    if (level >= 25) return 'Diamond';
    if (level >= 15) return 'Gold';
    if (level >= 8) return 'Silver';
    return 'Bronze';
}

function createDefaultProfile() {
    return {
        version: 1,
        level: 1,
        xp: 0,
        totalXp: 0,
        rank: getRankByLevel(1),
        updatedAt: Date.now(),
    };
}

function normalizeProfile(rawProfile) {
    const profile = { ...createDefaultProfile(), ...rawProfile };
    profile.level = Number.isFinite(profile.level) && profile.level > 0 ? Math.floor(profile.level) : 1;
    profile.xp = Number.isFinite(profile.xp) && profile.xp >= 0 ? Math.floor(profile.xp) : 0;
    profile.totalXp = Number.isFinite(profile.totalXp) && profile.totalXp >= 0 ? Math.floor(profile.totalXp) : 0;

    while (profile.xp >= getXpRequiredForLevel(profile.level)) {
        profile.xp -= getXpRequiredForLevel(profile.level);
        profile.level++;
    }

    profile.rank = getRankByLevel(profile.level);
    profile.updatedAt = Date.now();
    return profile;
}

function loadLocalProfile() {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
        const initial = createDefaultProfile();
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }

    try {
        const normalized = normalizeProfile(JSON.parse(raw));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    } catch {
        const fallback = createDefaultProfile();
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(fallback));
        return fallback;
    }
}

let profile = loadLocalProfile();

function saveLocalProfile() {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function renderProfile() {
    const levelEl = document.getElementById('profileLevel');
    const rankEl = document.getElementById('profileRank');
    const xpFillEl = document.getElementById('profileXpFill');
    const xpTextEl = document.getElementById('profileXpText');
    const totalXpEl = document.getElementById('profileTotalXp');
    if (!levelEl || !rankEl || !xpFillEl || !xpTextEl || !totalXpEl) return;

    const xpRequired = getXpRequiredForLevel(profile.level);
    const progress = Math.max(0, Math.min(100, Math.round((profile.xp / xpRequired) * 100)));

    levelEl.textContent = String(profile.level);
    rankEl.textContent = profile.rank;
    xpFillEl.style.width = `${progress}%`;
    xpTextEl.textContent = `${profile.xp} / ${xpRequired} XP`;
    totalXpEl.textContent = `Total: ${profile.totalXp} XP`;
}

function addXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    sessionXpGained += amount;
    profile.totalXp += amount;
    profile.xp += amount;

    while (profile.xp >= getXpRequiredForLevel(profile.level)) {
        profile.xp -= getXpRequiredForLevel(profile.level);
        profile.level++;
    }

    profile.rank = getRankByLevel(profile.level);
    profile.updatedAt = Date.now();
    saveLocalProfile();
    renderProfile();
}

// Função para criar modal customizado
function showModal(title, message, buttons) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const titleEl = document.createElement('div');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = message;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';

    buttons.forEach((btn) => {
        const button = document.createElement('button');
        button.className = `modal-button ${btn.type || 'secondary'}`;
        button.textContent = btn.text;
        button.onclick = () => {
            document.body.removeChild(overlay);
            if (btn.onClick) btn.onClick();
        };
        buttonsDiv.appendChild(button);
    });

    modal.appendChild(titleEl);
    modal.appendChild(content);
    modal.appendChild(buttonsDiv);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
}

themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');

    if (isDark) {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

renderProfile();

// Renderizar seleção de caracteres
function renderCharSelection() {
    const sections = document.getElementById('sections');
    sections.innerHTML = '';
    const mode = document.getElementById('mode').value;

    const groups = {
        'Hiragana Básico': (c) => c.type === 'hira' && c.group === 'basic',
        'Hiragana Dakuten (゛)': (c) => c.type === 'hira' && c.group === 'dakuten',
        'Hiragana Handakuten (゜)': (c) => c.type === 'hira' && c.group === 'handakuten',
        'Katakana Básico': (c) => c.type === 'kata' && c.group === 'basic',
        'Katakana Dakuten (゛)': (c) => c.type === 'kata' && c.group === 'dakuten',
        'Katakana Handakuten (゜)': (c) => c.type === 'kata' && c.group === 'handakuten',
    };

    Object.entries(groups).forEach(([title, filterFn]) => {
        const filtered = allChars.filter((c) => {
            if (mode === 'hira' && c.type !== 'hira') return false;
            if (mode === 'kata' && c.type !== 'kata') return false;
            return filterFn(c);
        });

        if (!filtered.length) return;

        const h3 = document.createElement('h3');
        h3.className = 'section-title';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        h3.appendChild(titleSpan);

        const controls = document.createElement('div');
        controls.className = 'section-controls';

        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = 'Todos';
        selectAllBtn.type = 'button';
        selectAllBtn.onclick = (e) => {
            e.preventDefault();
            const grid = h3.nextElementSibling;
            grid.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = true));
        };

        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.textContent = 'Nenhum';
        deselectAllBtn.type = 'button';
        deselectAllBtn.onclick = (e) => {
            e.preventDefault();
            const grid = h3.nextElementSibling;
            grid.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
        };

        controls.appendChild(selectAllBtn);
        controls.appendChild(deselectAllBtn);
        h3.appendChild(controls);

        sections.appendChild(h3);

        const grid = document.createElement('div');
        grid.className = 'grid';

        filtered.forEach((c, idx) => {
            const charIdx = allChars.indexOf(c);
            const div = document.createElement('div');
            div.className = 'char-checkbox';
            div.innerHTML = `
            <input type="checkbox" id="char-${charIdx}" value="${charIdx}" checked>
            <label for="char-${charIdx}">${c.char}</label>
          `;
            grid.appendChild(div);
        });

        sections.appendChild(grid);
    });
}

document.getElementById('mode').onchange = renderCharSelection;
renderCharSelection();

// Shuffle array
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Iniciar quiz
let quizMode = 'normal';
let selectedChars = []; // Lista de caracteres selecionados para o modo reverso

function startQuiz() {
    quizList = [];
    currentIndex = 0;
    hits = 0;
    miss = 0;
    sessionXpGained = 0;
    quizMode = document.getElementById('quizType').value;
    const repeat = Number(document.getElementById('repeat').value);

    selectedChars = [];
    document.querySelectorAll('#sections input:checked').forEach((cb) => {
        const c = allChars[cb.value];
        selectedChars.push(c);
    });

    if (selectedChars.length === 0) {
        showModal('⚠️ Atenção', 'Selecione pelo menos um caractere para começar!', [{ text: 'OK', type: 'primary' }]);
        return;
    }

    // Para modo combo, criar grupos de 3 caracteres
    if (quizMode === 'combo') {
        for (let i = 0; i < repeat; i++) {
            // Embaralhar e criar combos
            const shuffledChars = [...selectedChars];
            shuffle(shuffledChars);

            for (let j = 0; j < shuffledChars.length; j += 3) {
                const combo = shuffledChars.slice(j, j + 3);
                if (combo.length === 3) {
                    quizList.push(combo);
                }
            }
        }
    } else if (quizMode === 'study') {
        // Modo estudo: blocos de 4 caracteres com progressão
        studyCharStats = {};
        repetitionsPerChar = repeat;
        blockTeachingPhase = true; // Iniciar em fase de ensinamento
        activeCharPool = []; // Caracteres em aprendizado/prática

        // Inicializar stats para cada caractere
        selectedChars.forEach((c) => {
            studyCharStats[c.char] = {
                correct: 0,
                incorrect: 0,
                firstTime: true,
                teach: false,
            };
        });

        // Embaralhar TODOS os caracteres primeiro
        const shuffledChars = [...selectedChars];
        shuffle(shuffledChars);

        // Criar blocos de 4 caracteres a partir dos embaralhados
        studyBlocks = [];
        for (let i = 0; i < shuffledChars.length; i += 4) {
            const block = shuffledChars.slice(i, i + 4);
            studyBlocks.push(block);
        }

        // Iniciar com os primeiros 4 na pool ativa
        activeCharPool = [...studyBlocks[0]];
        quizList = [...activeCharPool];
        shuffle(quizList);
    } else {
        // Modos normal e reverso
        selectedChars.forEach((c) => {
            for (let i = 0; i < repeat; i++) {
                quizList.push(c);
            }
        });
    }

    if (quizList.length === 0) {
        showModal('⚠️ Atenção', 'Não há caracteres suficientes para criar combos! Selecione pelo menos 3.', [
            { text: 'OK', type: 'primary' },
        ]);
        return;
    }

    shuffle(quizList);
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    document.getElementById('exitBtn').classList.remove('hidden');

    // Mostrar/esconder modos apropriados
    document.getElementById('normalMode').classList.add('hidden');
    document.getElementById('reverseMode').classList.add('hidden');
    document.getElementById('comboMode').classList.add('hidden');
    document.getElementById('studyMode').classList.add('hidden');

    if (quizMode === 'reverse') {
        document.getElementById('reverseMode').classList.remove('hidden');
    } else if (quizMode === 'combo') {
        document.getElementById('comboMode').classList.remove('hidden');
    } else if (quizMode === 'study') {
        document.getElementById('studyMode').classList.remove('hidden');
    } else {
        document.getElementById('normalMode').classList.remove('hidden');
    }

    // Iniciar timer
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    showNextChar();
}

// Sair do quiz
function exitQuiz() {
    stopTimer();
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('exitBtn').classList.add('hidden');
}

// Atualizar timer
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent =
        `⏱️ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Parar timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function getElapsedTimeText() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}min ${seconds}s`;
}

function finishQuiz() {
    stopTimer();
    const timeStr = getElapsedTimeText();
    showModal(
        '🎉 Quiz Finalizado!',
        `
            <div class="stat-line">⏱️ Tempo: ${timeStr}</div>
            <div class="stat-line">✅ Acertos: ${hits}</div>
            <div class="stat-line">❌ Erros: ${miss}</div>
            <div class="stat-line">⭐ XP ganho: ${sessionXpGained}</div>
            <div class="stat-line">🏅 Nivel: ${profile.level} (${profile.rank})</div>
          `,
        [{ text: 'OK', type: 'primary', onClick: exitQuiz }],
    );
}

// Mostrar próximo caractere
function showNextChar() {
    // Para modo estudo, verificar se o bloco foi completado
    if (quizMode === 'study') {
        // Verificar se completou fase de ensinamento
        if (blockTeachingPhase) {
            const teachingComplete = activeCharPool.every((c) => !studyCharStats[c.char].firstTime);

            if (teachingComplete) {
                // Passar para fase de prática sem modal
                blockTeachingPhase = false;
                currentIndex = 0;
                // Criar lista de prática com os caracteres ativos
                quizList = [...activeCharPool];
                shuffle(quizList);
                showNextChar();
                return;
            }
        }

        // Verificar se todos os caracteres foram completados
        const allComplete = isStudyComplete();

        if (allComplete) {
            // Todos os caracteres concluídos
            finishQuiz();
            return;
        }
    }

    if (currentIndex >= quizList.length) {
        finishQuiz();
        return;
    }

    const progress = document.getElementById('progress');
    progress.textContent = `Questão ${currentIndex + 1} de ${quizList.length}`;

    if (quizMode === 'normal') {
        document.getElementById('currentChar').textContent = quizList[currentIndex].char;
        document.getElementById('answer').value = '';
        document.getElementById('answer').focus();
    } else if (quizMode === 'combo') {
        showComboQuestion();
    } else if (quizMode === 'study') {
        showStudyQuestion();
    } else {
        showReverseQuestion();
    }
}

// Mostrar questão no modo combo
function showComboQuestion() {
    const combo = quizList[currentIndex];
    const comboDiv = document.getElementById('comboChars');
    comboDiv.innerHTML = combo.map((c) => `<span>${c.char}</span>`).join('');
    document.getElementById('comboAnswer').value = '';
    document.getElementById('comboAnswer').focus();
}

// Submeter resposta do modo combo
function submitComboAnswer() {
    const input = document.getElementById('comboAnswer').value.trim().toLowerCase();
    const combo = quizList[currentIndex];
    const correctAnswer = combo.map((c) => c.romaji).join('');

    if (!input) return;

    combo.forEach((c) => {
        if (!perKana[c.char]) {
            perKana[c.char] = { hits: 0, miss: 0 };
        }
    });

    if (input === correctAnswer) {
        hits++;
        combo.forEach((c) => perKana[c.char].hits++);
        addXp(XP_REWARD.combo);
        showFeedback(true);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        currentIndex++;
        setTimeout(showNextChar, 300);
    } else {
        miss++;
        combo.forEach((c) => perKana[c.char].miss++);
        showFeedback(false);

        // Mostrar resposta correta e desabilitar input e botão
        const answerInput = document.getElementById('comboAnswer');
        const submitBtn = document.querySelector('#comboMode button');

        answerInput.value = correctAnswer;
        answerInput.style.borderColor = 'var(--error)';
        answerInput.style.background = 'rgba(239, 71, 111, 0.1)';
        answerInput.disabled = true;
        submitBtn.disabled = true;

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        // Adiciona o combo errado no final da lista
        quizList.push(combo);

        // Espera 2 segundos antes de pular para o próximo
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.background = '';
            answerInput.disabled = false;
            submitBtn.disabled = false;
            currentIndex++;
            showNextChar();
        }, 2000);
    }
}

// Mostrar questão no modo reverso
function showReverseQuestion() {
    const current = quizList[currentIndex];
    document.getElementById('romajiDisplay').textContent = current.romaji;

    // Gerar 2 opções erradas aleatórias
    const wrongOptions = [];
    const availableChars = selectedChars.filter((c) => c.char !== current.char);

    while (wrongOptions.length < 2 && availableChars.length > 0) {
        const randomIdx = Math.floor(Math.random() * availableChars.length);
        const wrongChar = availableChars[randomIdx];

        // Evitar duplicatas e caracteres com mesmo romaji
        if (!wrongOptions.find((w) => w.char === wrongChar.char) && wrongChar.romaji !== current.romaji) {
            wrongOptions.push(wrongChar);
        }
        availableChars.splice(randomIdx, 1);
    }

    // Misturar opções
    const options = [current, ...wrongOptions];
    shuffle(options);

    // Renderizar opções
    const optionsDiv = document.getElementById('charOptions');
    optionsDiv.innerHTML = '';

    options.forEach((option) => {
        const btn = document.createElement('div');
        btn.className = 'char-option';
        btn.textContent = option.char;
        btn.onclick = () => checkReverseAnswer(option.char === current.char, btn);
        optionsDiv.appendChild(btn);
    });
}

// Verificar resposta do modo reverso
function checkReverseAnswer(isCorrect, clickedBtn) {
    const current = quizList[currentIndex];

    // Desabilitar todos os botões
    document.querySelectorAll('.char-option').forEach((btn) => {
        btn.classList.add('disabled');
    });

    if (!perKana[current.char]) {
        perKana[current.char] = { hits: 0, miss: 0 };
    }

    if (isCorrect) {
        hits++;
        perKana[current.char].hits++;
        addXp(XP_REWARD.reverse);
        clickedBtn.classList.add('correct');
        showFeedback(true);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        currentIndex++;
        setTimeout(showNextChar, 800);
    } else {
        miss++;
        perKana[current.char].miss++;
        clickedBtn.classList.add('wrong');

        // Destacar a resposta correta
        document.querySelectorAll('.char-option').forEach((btn) => {
            if (btn.textContent === current.char) {
                btn.classList.add('correct');
            }
        });

        showFeedback(false);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        // Adiciona no final da lista
        quizList.push(current);

        setTimeout(() => {
            currentIndex++;
            showNextChar();
        }, 2000);
    }
}

// Mostrar feedback visual
function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect ? '✅' : '❌';
    feedback.classList.add('show');

    setTimeout(() => {
        feedback.classList.remove('show');
    }, 500);
}

// Submeter resposta
function submitAnswer() {
    const input = document.getElementById('answer').value.trim().toLowerCase();
    const current = quizList[currentIndex];

    if (!input) return;

    if (!perKana[current.char]) {
        perKana[current.char] = { hits: 0, miss: 0 };
    }

    if (input === current.romaji) {
        hits++;
        perKana[current.char].hits++;
        addXp(XP_REWARD.normal);
        showFeedback(true);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        currentIndex++;
        setTimeout(showNextChar, 300);
    } else {
        miss++;
        perKana[current.char].miss++;
        showFeedback(false);

        // Mostrar resposta correta e desabilitar input e botão
        const answerInput = document.getElementById('answer');
        const submitBtn = document.querySelector('#normalMode button');

        answerInput.value = current.romaji;
        answerInput.style.borderColor = 'var(--error)';
        answerInput.style.background = 'rgba(239, 71, 111, 0.1)';
        answerInput.disabled = true;
        submitBtn.disabled = true;

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        // Adiciona o caractere errado no final da lista (não imediatamente após)
        quizList.push(current);

        // Espera 2 segundos antes de pular para o próximo
        setTimeout(() => {
            answerInput.style.borderColor = '';
            answerInput.style.background = '';
            answerInput.disabled = false;
            submitBtn.disabled = false;
            currentIndex++;
            showNextChar();
        }, 2000);
    }
}

// Enter para submeter
const answerInputEl = document.getElementById('answer');
const comboAnswerInputEl = document.getElementById('comboAnswer');

answerInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        submitAnswer();
    }
});

comboAnswerInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        submitComboAnswer();
    }
});

// FUNÇÕES PARA MODO ESTUDO
function getStudyProgress() {
    const completed = selectedChars.filter((c) => studyCharStats[c.char].correct >= repetitionsPerChar).length;
    return { completed, total: selectedChars.length };
}

function isStudyComplete() {
    return selectedChars.every((c) => studyCharStats[c.char].correct >= repetitionsPerChar);
}

function buildStudyOptions(current) {
    const wrongOptions = [];
    const availableChars = selectedChars.filter((c) => c.char !== current.char);

    while (wrongOptions.length < 3 && availableChars.length > 0) {
        const randomIdx = Math.floor(Math.random() * availableChars.length);
        const wrongChar = availableChars[randomIdx];

        // Evitar duplicatas e caracteres com mesmo romaji
        if (!wrongOptions.find((w) => w.romaji === wrongChar.romaji) && wrongChar.romaji !== current.romaji) {
            wrongOptions.push(wrongChar);
        }
        availableChars.splice(randomIdx, 1);
    }

    // Se não tiver 3 opções únicas, completa com o que restar
    while (wrongOptions.length < 3 && availableChars.length > 0) {
        const randomIdx = Math.floor(Math.random() * availableChars.length);
        wrongOptions.push(availableChars[randomIdx]);
        availableChars.splice(randomIdx, 1);
    }

    const options = [current.romaji, ...wrongOptions.map((c) => c.romaji)];
    shuffle(options);
    return options;
}

function renderStudyOptions(current, options) {
    const optionsDiv = document.getElementById('studyOptions');
    optionsDiv.innerHTML = '';

    options.forEach((option) => {
        const btn = document.createElement('div');
        btn.className = 'study-option';
        btn.textContent = option;
        btn.onclick = () => checkStudyAnswer(option === current.romaji, btn, current);
        optionsDiv.appendChild(btn);
    });
}

function refreshStudyQuizList() {
    currentIndex = 0;
    quizList = [...activeCharPool];
    shuffle(quizList);
}

function unlockNextStudyCharIfNeeded() {
    if (blockTeachingPhase) return;

    const unlockedChars = selectedChars.filter(
        (c) => !activeCharPool.find((ac) => ac.char === c.char) && studyCharStats[c.char].correct < repetitionsPerChar,
    );
    if (unlockedChars.length > 0) {
        activeCharPool.push(unlockedChars[0]);
    }
}

function showStudyQuestion() {
    const current = quizList[currentIndex];
    const stats = studyCharStats[current.char];

    // Calcular progresso total de todos os caracteres selecionados
    const progressData = getStudyProgress();

    // Atualizar barra de progresso com progresso total
    const progress = document.getElementById('progress');
    progress.textContent = `${progressData.completed} de ${progressData.total}`;

    // Se é a primeira vez que aparece esse caractere, mostrar ensinamento
    if (stats.firstTime) {
        showStudyTeachFirst(current);
    }
    // Se o caractere foi errado muitas vezes, mostrar resposta novamente
    else if (stats.teach) {
        showStudyTeachAgain(current);
    }
    // Caso contrário, praticar com opções
    else {
        showStudyPractice(current);
    }
}

function showStudyTeachFirst(current) {
    // Primeira apresentação: apenas o romaji e botão OK
    const teachingDiv = document.getElementById('studyTeaching');
    teachingDiv.innerHTML = `<strong>📖 Aprenda:</strong> <span style="font-size: 1.5em; color: var(--primary);">${current.romaji}</span>`;

    const charDiv = document.getElementById('studyChar');
    charDiv.textContent = current.char;

    const optionsDiv = document.getElementById('studyOptions');
    optionsDiv.innerHTML = '';

    // Criar botão OK
    const okBtn = document.createElement('div');
    okBtn.className = 'study-option';
    okBtn.style.gridColumn = 'span 2';
    okBtn.style.fontSize = '1.2em';
    okBtn.textContent = '✅ Entendi';
    okBtn.onclick = () => markFirstTimeAndContinue(current);
    optionsDiv.appendChild(okBtn);
}

function markFirstTimeAndContinue(current) {
    studyCharStats[current.char].firstTime = false;
    showFeedback(true);
    currentIndex++;
    setTimeout(() => {
        showNextChar();
    }, 600);
}

function showStudyPractice(current) {
    // Praticar com opções
    const teachingDiv = document.getElementById('studyTeaching');
    teachingDiv.innerHTML = '<strong>📚 Prática</strong>';

    // Mostrar o caractere
    document.getElementById('studyChar').textContent = current.char;

    const options = buildStudyOptions(current);
    renderStudyOptions(current, options);
}

function showStudyTeachAgain(current) {
    // Reapresentação com resposta destacada (porque errou demais)
    const teachingDiv = document.getElementById('studyTeaching');
    teachingDiv.innerHTML = `<strong>📖 Reaprendendo:</strong> <span style="font-size: 1.5em; color: var(--success); font-weight: 700;">${current.romaji}</span>`;

    // Mostrar o caractere
    document.getElementById('studyChar').textContent = current.char;

    const options = buildStudyOptions(current);
    renderStudyOptions(current, options);
}

function checkStudyAnswer(isCorrect, clickedBtn, current) {
    const stats = studyCharStats[current.char];

    // Desabilitar todos os botões
    document.querySelectorAll('.study-option').forEach((btn) => {
        btn.classList.add('disabled');
    });

    if (!perKana[current.char]) {
        perKana[current.char] = { hits: 0, miss: 0 };
    }

    if (isCorrect) {
        hits++;
        perKana[current.char].hits++;
        addXp(XP_REWARD.study);
        stats.correct++;
        stats.teach = false;
        stats.incorrect = 0;
        clickedBtn.classList.add('correct');
        showFeedback(true);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        // Verificar se todos os caracteres foram completados
        const allComplete = isStudyComplete();

        if (allComplete) {
            // Todos completados, fim do quiz
            setTimeout(showNextChar, 800);
        } else {
            // Só remove da pool quando o caractere atingiu o total necessário de acertos.
            const reachedTarget = stats.correct >= repetitionsPerChar;
            if (reachedTarget) {
                activeCharPool = activeCharPool.filter((c) => c.char !== current.char);

                // Mantém até 4 ativos: ao concluir 1, libera 1 novo caractere.
                unlockNextStudyCharIfNeeded();
            }

            if (activeCharPool.length > 0) {
                refreshStudyQuizList();
            } else {
                quizList = [];
            }

            currentIndex = 0;
            setTimeout(showNextChar, 800);
        }
    } else {
        miss++;
        perKana[current.char].miss++;
        stats.incorrect++;
        clickedBtn.classList.add('wrong');

        // Mostrar resposta correta
        document.querySelectorAll('.study-option').forEach((btn) => {
            if (btn.textContent === current.romaji) {
                btn.classList.add('correct');
            }
        });

        showFeedback(false);

        localStorage.setItem('kanaStats', JSON.stringify({ hits, miss, perKana }));

        // Se errou 2 vezes, ativa ensinamento para próxima vez
        if (stats.incorrect >= 2) {
            stats.teach = true;
        }

        // Embaralhar e mostrar aleatório (não repetir logo o mesmo)
        setTimeout(() => {
            document.querySelectorAll('.study-option').forEach((btn) => {
                btn.classList.remove('disabled', 'correct', 'wrong');
            });
            refreshStudyQuizList();
            showStudyQuestion();
        }, 1500);
    }
}

// Botão de sair
document.getElementById('exitBtn').onclick = () => {
    showModal('🚪 Sair do Quiz?', 'Tem certeza que deseja sair? Seu progresso será perdido.', [
        { text: 'Cancelar', type: 'secondary' },
        { text: 'Sair', type: 'primary', onClick: exitQuiz },
    ]);
};


// Expose handlers for inline HTML attributes
window.startQuiz = startQuiz;
window.submitAnswer = submitAnswer;
window.submitComboAnswer = submitComboAnswer;
