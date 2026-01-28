const allChars = [
    // Hiragana básico
    { char: 'あ', romaji: 'a', type: 'hira', group: 'basic' },
    { char: 'い', romaji: 'i', type: 'hira', group: 'basic' },
    { char: 'う', romaji: 'u', type: 'hira', group: 'basic' },
    { char: 'え', romaji: 'e', type: 'hira', group: 'basic' },
    { char: 'お', romaji: 'o', type: 'hira', group: 'basic' },
    { char: 'か', romaji: 'ka', type: 'hira', group: 'basic' },
    { char: 'き', romaji: 'ki', type: 'hira', group: 'basic' },
    { char: 'く', romaji: 'ku', type: 'hira', group: 'basic' },
    { char: 'け', romaji: 'ke', type: 'hira', group: 'basic' },
    { char: 'こ', romaji: 'ko', type: 'hira', group: 'basic' },
    { char: 'さ', romaji: 'sa', type: 'hira', group: 'basic' },
    { char: 'し', romaji: 'shi', type: 'hira', group: 'basic' },
    { char: 'す', romaji: 'su', type: 'hira', group: 'basic' },
    { char: 'せ', romaji: 'se', type: 'hira', group: 'basic' },
    { char: 'そ', romaji: 'so', type: 'hira', group: 'basic' },
    { char: 'た', romaji: 'ta', type: 'hira', group: 'basic' },
    { char: 'ち', romaji: 'chi', type: 'hira', group: 'basic' },
    { char: 'つ', romaji: 'tsu', type: 'hira', group: 'basic' },
    { char: 'て', romaji: 'te', type: 'hira', group: 'basic' },
    { char: 'と', romaji: 'to', type: 'hira', group: 'basic' },
    { char: 'な', romaji: 'na', type: 'hira', group: 'basic' },
    { char: 'に', romaji: 'ni', type: 'hira', group: 'basic' },
    { char: 'ぬ', romaji: 'nu', type: 'hira', group: 'basic' },
    { char: 'ね', romaji: 'ne', type: 'hira', group: 'basic' },
    { char: 'の', romaji: 'no', type: 'hira', group: 'basic' },
    { char: 'は', romaji: 'ha', type: 'hira', group: 'basic' },
    { char: 'ひ', romaji: 'hi', type: 'hira', group: 'basic' },
    { char: 'ふ', romaji: 'fu', type: 'hira', group: 'basic' },
    { char: 'へ', romaji: 'he', type: 'hira', group: 'basic' },
    { char: 'ほ', romaji: 'ho', type: 'hira', group: 'basic' },
    { char: 'ま', romaji: 'ma', type: 'hira', group: 'basic' },
    { char: 'み', romaji: 'mi', type: 'hira', group: 'basic' },
    { char: 'む', romaji: 'mu', type: 'hira', group: 'basic' },
    { char: 'め', romaji: 'me', type: 'hira', group: 'basic' },
    { char: 'も', romaji: 'mo', type: 'hira', group: 'basic' },
    { char: 'や', romaji: 'ya', type: 'hira', group: 'basic' },
    { char: 'ゆ', romaji: 'yu', type: 'hira', group: 'basic' },
    { char: 'よ', romaji: 'yo', type: 'hira', group: 'basic' },
    { char: 'ら', romaji: 'ra', type: 'hira', group: 'basic' },
    { char: 'り', romaji: 'ri', type: 'hira', group: 'basic' },
    { char: 'る', romaji: 'ru', type: 'hira', group: 'basic' },
    { char: 'れ', romaji: 're', type: 'hira', group: 'basic' },
    { char: 'ろ', romaji: 'ro', type: 'hira', group: 'basic' },
    { char: 'わ', romaji: 'wa', type: 'hira', group: 'basic' },
    { char: 'を', romaji: 'wo', type: 'hira', group: 'basic' },
    { char: 'ん', romaji: 'n', type: 'hira', group: 'basic' },

    // Hiragana Dakuten
    { char: 'が', romaji: 'ga', type: 'hira', group: 'dakuten' },
    { char: 'ぎ', romaji: 'gi', type: 'hira', group: 'dakuten' },
    { char: 'ぐ', romaji: 'gu', type: 'hira', group: 'dakuten' },
    { char: 'げ', romaji: 'ge', type: 'hira', group: 'dakuten' },
    { char: 'ご', romaji: 'go', type: 'hira', group: 'dakuten' },
    { char: 'ざ', romaji: 'za', type: 'hira', group: 'dakuten' },
    { char: 'じ', romaji: 'ji', type: 'hira', group: 'dakuten' },
    { char: 'ず', romaji: 'zu', type: 'hira', group: 'dakuten' },
    { char: 'ぜ', romaji: 'ze', type: 'hira', group: 'dakuten' },
    { char: 'ぞ', romaji: 'zo', type: 'hira', group: 'dakuten' },
    { char: 'だ', romaji: 'da', type: 'hira', group: 'dakuten' },
    { char: 'ぢ', romaji: 'ji', type: 'hira', group: 'dakuten' },
    { char: 'づ', romaji: 'zu', type: 'hira', group: 'dakuten' },
    { char: 'で', romaji: 'de', type: 'hira', group: 'dakuten' },
    { char: 'ど', romaji: 'do', type: 'hira', group: 'dakuten' },
    { char: 'ば', romaji: 'ba', type: 'hira', group: 'dakuten' },
    { char: 'び', romaji: 'bi', type: 'hira', group: 'dakuten' },
    { char: 'ぶ', romaji: 'bu', type: 'hira', group: 'dakuten' },
    { char: 'べ', romaji: 'be', type: 'hira', group: 'dakuten' },
    { char: 'ぼ', romaji: 'bo', type: 'hira', group: 'dakuten' },

    // Hiragana Handakuten
    { char: 'ぱ', romaji: 'pa', type: 'hira', group: 'handakuten' },
    { char: 'ぴ', romaji: 'pi', type: 'hira', group: 'handakuten' },
    { char: 'ぷ', romaji: 'pu', type: 'hira', group: 'handakuten' },
    { char: 'ぺ', romaji: 'pe', type: 'hira', group: 'handakuten' },
    { char: 'ぽ', romaji: 'po', type: 'hira', group: 'handakuten' },

    // Katakana básico
    { char: 'ア', romaji: 'a', type: 'kata', group: 'basic' },
    { char: 'イ', romaji: 'i', type: 'kata', group: 'basic' },
    { char: 'ウ', romaji: 'u', type: 'kata', group: 'basic' },
    { char: 'エ', romaji: 'e', type: 'kata', group: 'basic' },
    { char: 'オ', romaji: 'o', type: 'kata', group: 'basic' },
    { char: 'カ', romaji: 'ka', type: 'kata', group: 'basic' },
    { char: 'キ', romaji: 'ki', type: 'kata', group: 'basic' },
    { char: 'ク', romaji: 'ku', type: 'kata', group: 'basic' },
    { char: 'ケ', romaji: 'ke', type: 'kata', group: 'basic' },
    { char: 'コ', romaji: 'ko', type: 'kata', group: 'basic' },
    { char: 'サ', romaji: 'sa', type: 'kata', group: 'basic' },
    { char: 'シ', romaji: 'shi', type: 'kata', group: 'basic' },
    { char: 'ス', romaji: 'su', type: 'kata', group: 'basic' },
    { char: 'セ', romaji: 'se', type: 'kata', group: 'basic' },
    { char: 'ソ', romaji: 'so', type: 'kata', group: 'basic' },
    { char: 'タ', romaji: 'ta', type: 'kata', group: 'basic' },
    { char: 'チ', romaji: 'chi', type: 'kata', group: 'basic' },
    { char: 'ツ', romaji: 'tsu', type: 'kata', group: 'basic' },
    { char: 'テ', romaji: 'te', type: 'kata', group: 'basic' },
    { char: 'ト', romaji: 'to', type: 'kata', group: 'basic' },
    { char: 'ナ', romaji: 'na', type: 'kata', group: 'basic' },
    { char: 'ニ', romaji: 'ni', type: 'kata', group: 'basic' },
    { char: 'ヌ', romaji: 'nu', type: 'kata', group: 'basic' },
    { char: 'ネ', romaji: 'ne', type: 'kata', group: 'basic' },
    { char: 'ノ', romaji: 'no', type: 'kata', group: 'basic' },
    { char: 'ハ', romaji: 'ha', type: 'kata', group: 'basic' },
    { char: 'ヒ', romaji: 'hi', type: 'kata', group: 'basic' },
    { char: 'フ', romaji: 'fu', type: 'kata', group: 'basic' },
    { char: 'ヘ', romaji: 'he', type: 'kata', group: 'basic' },
    { char: 'ホ', romaji: 'ho', type: 'kata', group: 'basic' },
    { char: 'マ', romaji: 'ma', type: 'kata', group: 'basic' },
    { char: 'ミ', romaji: 'mi', type: 'kata', group: 'basic' },
    { char: 'ム', romaji: 'mu', type: 'kata', group: 'basic' },
    { char: 'メ', romaji: 'me', type: 'kata', group: 'basic' },
    { char: 'モ', romaji: 'mo', type: 'kata', group: 'basic' },
    { char: 'ヤ', romaji: 'ya', type: 'kata', group: 'basic' },
    { char: 'ユ', romaji: 'yu', type: 'kata', group: 'basic' },
    { char: 'ヨ', romaji: 'yo', type: 'kata', group: 'basic' },
    { char: 'ラ', romaji: 'ra', type: 'kata', group: 'basic' },
    { char: 'リ', romaji: 'ri', type: 'kata', group: 'basic' },
    { char: 'ル', romaji: 'ru', type: 'kata', group: 'basic' },
    { char: 'レ', romaji: 're', type: 'kata', group: 'basic' },
    { char: 'ロ', romaji: 'ro', type: 'kata', group: 'basic' },
    { char: 'ワ', romaji: 'wa', type: 'kata', group: 'basic' },
    { char: 'ヲ', romaji: 'wo', type: 'kata', group: 'basic' },
    { char: 'ン', romaji: 'n', type: 'kata', group: 'basic' },

    // Katakana Dakuten
    { char: 'ガ', romaji: 'ga', type: 'kata', group: 'dakuten' },
    { char: 'ギ', romaji: 'gi', type: 'kata', group: 'dakuten' },
    { char: 'グ', romaji: 'gu', type: 'kata', group: 'dakuten' },
    { char: 'ゲ', romaji: 'ge', type: 'kata', group: 'dakuten' },
    { char: 'ゴ', romaji: 'go', type: 'kata', group: 'dakuten' },
    { char: 'ザ', romaji: 'za', type: 'kata', group: 'dakuten' },
    { char: 'ジ', romaji: 'ji', type: 'kata', group: 'dakuten' },
    { char: 'ズ', romaji: 'zu', type: 'kata', group: 'dakuten' },
    { char: 'ゼ', romaji: 'ze', type: 'kata', group: 'dakuten' },
    { char: 'ゾ', romaji: 'zo', type: 'kata', group: 'dakuten' },
    { char: 'ダ', romaji: 'da', type: 'kata', group: 'dakuten' },
    { char: 'ヂ', romaji: 'ji', type: 'kata', group: 'dakuten' },
    { char: 'ヅ', romaji: 'zu', type: 'kata', group: 'dakuten' },
    { char: 'デ', romaji: 'de', type: 'kata', group: 'dakuten' },
    { char: 'ド', romaji: 'do', type: 'kata', group: 'dakuten' },
    { char: 'バ', romaji: 'ba', type: 'kata', group: 'dakuten' },
    { char: 'ビ', romaji: 'bi', type: 'kata', group: 'dakuten' },
    { char: 'ブ', romaji: 'bu', type: 'kata', group: 'dakuten' },
    { char: 'ベ', romaji: 'be', type: 'kata', group: 'dakuten' },
    { char: 'ボ', romaji: 'bo', type: 'kata', group: 'dakuten' },

    // Katakana Handakuten
    { char: 'パ', romaji: 'pa', type: 'kata', group: 'handakuten' },
    { char: 'ピ', romaji: 'pi', type: 'kata', group: 'handakuten' },
    { char: 'プ', romaji: 'pu', type: 'kata', group: 'handakuten' },
    { char: 'ペ', romaji: 'pe', type: 'kata', group: 'handakuten' },
    { char: 'ポ', romaji: 'po', type: 'kata', group: 'handakuten' },
];

// Estado
const savedStats = JSON.parse(localStorage.getItem('kanaStats') || '{"hits":0,"miss":0,"perKana":{}}');
let hits = savedStats.hits || 0;
let miss = savedStats.miss || 0;
let perKana = savedStats.perKana || {};
let quizList = [];
let currentIndex = 0;
let startTime = null;
let timerInterval = null;

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

    if (quizMode === 'reverse') {
        document.getElementById('reverseMode').classList.remove('hidden');
    } else if (quizMode === 'combo') {
        document.getElementById('comboMode').classList.remove('hidden');
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

// Mostrar próximo caractere
function showNextChar() {
    if (currentIndex >= quizList.length) {
        stopTimer();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes}min ${seconds}s`;

        showModal(
            '🎉 Quiz Finalizado!',
            `
            <div class="stat-line">⏱️ Tempo: ${timeStr}</div>
            <div class="stat-line">✅ Acertos: ${hits}</div>
            <div class="stat-line">❌ Erros: ${miss}</div>
          `,
            [{ text: 'OK', type: 'primary', onClick: exitQuiz }],
        );
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
document.getElementById('answer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

document.getElementById('comboAnswer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitComboAnswer();
    }
});

// Botão de sair
document.getElementById('exitBtn').onclick = () => {
    showModal('🚪 Sair do Quiz?', 'Tem certeza que deseja sair? Seu progresso será perdido.', [
        { text: 'Cancelar', type: 'secondary' },
        { text: 'Sair', type: 'primary', onClick: exitQuiz },
    ]);
};
