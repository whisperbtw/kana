<script setup lang="ts">
import { ref, computed } from 'vue';
import type { KanaMode, QuizMode, QuizSection } from '~/composables/useKanaQuiz';

const mode = defineModel<KanaMode>('mode', { required: true });
const quizType = defineModel<QuizMode>('quizType', { required: true });
const repeat = defineModel<number>('repeat', { required: true });
const selectedCharIds = defineModel<number[]>('selectedCharIds', { required: true });

const props = defineProps<{
    sections: QuizSection[];
}>();

const emit = defineEmits<{
    setSectionSelection: [indices: number[], checked: boolean];
    startQuiz: [];
}>();

const currentStep = ref(1);
const totalSteps = 3;

function goStep(n: number) {
    currentStep.value = n;
}

function setMode(m: KanaMode) {
    mode.value = m;
}

const modeOptions: { value: KanaMode; hiragana: string; katakana: string; label: string }[] = [
    { value: 'hira', hiragana: 'あ', katakana: '', label: 'Hiragana' },
    { value: 'kata', hiragana: 'ア', katakana: '', label: 'Katakana' },
    { value: 'all', hiragana: 'あ', katakana: 'ア', label: 'Ambos' },
];

const quizTypeOptions: { value: QuizMode; label: string; desc: string }[] = [
    { value: 'normal', label: 'Normal', desc: 'Ver caractere → digitar romaji' },
    { value: 'reverse', label: 'Reverso', desc: 'Ver romaji → clicar no caractere' },
    { value: 'combo', label: 'Combo', desc: 'Ver 3 caracteres → digitar junto' },
    { value: 'study', label: 'Estudo', desc: 'Aprender e praticar no seu ritmo' },
];

const selectedCount = computed(() => selectedCharIds.value.length);
const totalChars = computed(() => props.sections.reduce((a, s) => a + s.chars.length, 0));

function canProceed(step: number) {
    if (step === 2) return selectedCount.value > 0;
    return true;
}
</script>

<template>
    <section class="setup-wrap">
        <!-- Progress bar -->
        <div class="progress-bar" aria-label="Etapa atual">
            <div v-for="n in totalSteps" :key="n" class="prog-seg" :class="{ active: n <= currentStep }" />
        </div>

        <!-- ── STEP 1: Modo ── -->
        <transition name="slide">
            <div v-if="currentStep === 1" class="step">
                <header class="step-head">
                    <span class="step-num">01</span>
                    <div>
                        <h2 class="step-title">Modo de estudo</h2>
                        <p class="step-sub">Qual alfabeto você quer praticar?</p>
                    </div>
                </header>

                <div class="mode-grid">
                    <button
                        v-for="opt in modeOptions"
                        :key="opt.value"
                        type="button"
                        class="mode-btn"
                        :class="{ active: mode === opt.value }"
                        @click="setMode(opt.value)"
                    >
                        <span class="mode-kana">
                            <span class="k-hira">{{ opt.hiragana }}</span>
                            <span v-if="opt.value === 'all'" class="k-kata">{{ opt.katakana }}</span>
                        </span>
                        <span class="mode-label">{{ opt.label }}</span>
                    </button>
                </div>

                <div class="step-nav">
                    <button type="button" class="btn-next" @click="goStep(2)">
                        Próximo <span class="arrow">→</span>
                    </button>
                </div>
            </div>
        </transition>

        <!-- ── STEP 2: Caracteres ── -->
        <transition name="slide">
            <div v-if="currentStep === 2" class="step">
                <header class="step-head">
                    <span class="step-num">02</span>
                    <div>
                        <h2 class="step-title">Caracteres</h2>
                        <p class="step-sub">{{ selectedCount }} de {{ totalChars }} selecionados</p>
                    </div>
                </header>

                <div class="sections">
                    <template v-for="section in sections" :key="section.title">
                        <div class="section-row">
                            <span class="section-name">{{ section.title }}</span>
                            <div class="sec-btns">
                                <button
                                    type="button"
                                    class="sec-btn"
                                    @click="
                                        emit('setSectionSelection',
                                            section.chars.map((c) => c.index),
                                            true,
                                        )
                                    "
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    class="sec-btn"
                                    @click="
                                        emit('setSectionSelection',
                                            section.chars.map((c) => c.index),
                                            false,
                                        )
                                    "
                                >
                                    Nenhum
                                </button>
                            </div>
                        </div>

                        <div class="char-grid">
                            <div v-for="char in section.chars" :key="char.index" class="char-cell">
                                <input
                                    :id="`char-${char.index}`"
                                    v-model="selectedCharIds"
                                    type="checkbox"
                                    :value="char.index"
                                />
                                <label :for="`char-${char.index}`">{{ char.char }}</label>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="step-nav">
                    <button type="button" class="btn-back" @click="goStep(1)">← Voltar</button>
                    <button type="button" class="btn-next" :disabled="!canProceed(2)" @click="goStep(3)">
                        Próximo <span class="arrow">→</span>
                    </button>
                </div>
            </div>
        </transition>

        <!-- ── STEP 3: Configurações ── -->
        <transition name="slide">
            <div v-if="currentStep === 3" class="step">
                <header class="step-head">
                    <span class="step-num">03</span>
                    <div>
                        <h2 class="step-title">Configurações</h2>
                        <p class="step-sub">Ajuste como o quiz vai funcionar</p>
                    </div>
                </header>

                <div v-if="quizType !== 'study'" class="config-block">
                    <label class="config-label" for="repeat">Repetições por caractere</label>
                    <div class="repeat-row">
                        <button
                            type="button"
                            class="rep-btn"
                            :disabled="repeat <= 1"
                            @click="repeat = Math.max(1, repeat - 1)"
                        >
                            −
                        </button>
                        <input id="repeat" v-model.number="repeat" type="number" min="1" max="10" class="rep-input" />
                        <button
                            type="button"
                            class="rep-btn"
                            :disabled="repeat >= 10"
                            @click="repeat = Math.min(10, repeat + 1)"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div v-else class="config-block adaptive-info">
                    <span class="config-label">Estudo adaptativo</span>
                    <p class="adaptive-description">
                        Novos caracteres aparecem aos poucos. Acertos espaçam as revisões; erros fazem o caractere
                        voltar mais cedo com uma dica.
                    </p>
                </div>

                <div class="config-block">
                    <label class="config-label">Tipo de quiz</label>
                    <div class="quiz-type-grid">
                        <button
                            v-for="opt in quizTypeOptions"
                            :key="opt.value"
                            type="button"
                            class="quiz-type-btn"
                            :class="{ active: quizType === opt.value }"
                            @click="quizType = opt.value"
                        >
                            <span class="qt-label">{{ opt.label }}</span>
                            <span class="qt-desc">{{ opt.desc }}</span>
                        </button>
                    </div>
                </div>

                <div class="step-nav">
                    <button type="button" class="btn-back" @click="goStep(2)">← Voltar</button>
                    <button type="button" class="btn-start" @click="emit('startQuiz')">Começar quiz</button>
                </div>
            </div>
        </transition>
    </section>
</template>

<style scoped>
/* ── Layout ── */
.setup-wrap {
    background: linear-gradient(170deg, color-mix(in srgb, var(--card) 94%, #fff 6%), var(--card));
    padding: clamp(22px, 3.5vw, 36px);
    border-radius: 24px;
    box-shadow: 0 18px 38px var(--shadow);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
}

.setup-wrap::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent);
    opacity: 0.6;
}

/* ── Progress ── */
.progress-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 2rem;
}

.prog-seg {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--border) 80%, transparent);
    transition: background 0.35s ease;
}

.prog-seg.active {
    background: linear-gradient(90deg, var(--primary), var(--secondary));
}

/* ── Step transition ── */
.slide-enter-active,
.slide-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}
.slide-enter-from {
    opacity: 0;
    transform: translateX(18px);
}
.slide-leave-to {
    opacity: 0;
    transform: translateX(-18px);
}

/* ── Step header ── */
.step-head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 1.75rem;
}

.step-num {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    font-family: 'JetBrains Mono', monospace;
    color: var(--primary);
    padding-top: 3px;
    flex-shrink: 0;
}

.step-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 4px;
}

.step-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin: 0;
}

/* ── Mode buttons ── */
.mode-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 2rem;
}

.mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 10px 16px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--tile) 82%, transparent);
    cursor: pointer;
    gap: 10px;
    transition: all 0.2s ease;
    color: var(--text);
}

.mode-btn:hover {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    transform: translateY(-2px);
}

.mode-btn.active {
    border-color: transparent;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    box-shadow: 0 10px 24px color-mix(in srgb, var(--primary) 30%, transparent);
    color: #fff;
}

.mode-kana {
    display: flex;
    align-items: center;
    gap: 2px;
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 2.2rem;
    line-height: 1;
}

.k-kata {
    opacity: 0.6;
}

.mode-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
}

/* ── Sections & chars ── */
.sections {
    margin-bottom: 1.5rem;
    max-height: 48vh;
    overflow-y: auto;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}

.section-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin: 1.25rem 0 0.6rem;
    padding-left: 10px;
    border-left: 3px solid var(--secondary);
}

.section-name {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
}

.sec-btns {
    display: flex;
    gap: 6px;
}

.sec-btn {
    font-size: 0.68rem;
    padding: 4px 9px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--tile) 88%, transparent);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.18s ease;
}

.sec-btn:hover {
    background: linear-gradient(125deg, var(--primary), var(--secondary));
    color: #fff;
    border-color: transparent;
}

.char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
    margin-bottom: 0.5rem;
}

.char-cell {
    position: relative;
}

.char-cell input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.char-cell label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 58px;
    border-radius: 12px;
    border: 1px solid var(--border);
    font-size: 1.5rem;
    font-family: 'Noto Sans JP', sans-serif;
    background: color-mix(in srgb, var(--tile) 84%, transparent);
    cursor: pointer;
    transition: all 0.18s ease;
    color: var(--text);
}

.char-cell label:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 60%, transparent);
}

.char-cell input:checked + label {
    color: #fff;
    border-color: transparent;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 32%, transparent);
}

/* ── Config ── */
.config-block {
    margin-bottom: 1.5rem;
}

.config-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
}

.adaptive-info {
    padding: 14px 16px;
    border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--border));
    border-radius: 14px;
    background: color-mix(in srgb, var(--primary) 7%, var(--tile));
}

.adaptive-description {
    margin: 0;
    color: var(--muted);
    font-size: 0.8rem;
    line-height: 1.55;
}

/* Repeat stepper */
.repeat-row {
    display: flex;
    align-items: center;
    gap: 0;
    width: fit-content;
}

.rep-btn {
    width: 42px;
    height: 42px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--tile) 82%, transparent);
    color: var(--text);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.18s ease;
    line-height: 1;
}

.rep-btn:first-child {
    border-radius: 10px 0 0 10px;
}

.rep-btn:last-child {
    border-radius: 0 10px 10px 0;
}

.rep-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: #fff;
    border-color: transparent;
}

.rep-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.rep-input {
    width: 58px;
    height: 42px;
    text-align: center;
    border: 1px solid var(--border);
    border-left: none;
    border-right: none;
    background: color-mix(in srgb, var(--tile) 92%, transparent);
    color: var(--text);
    font-size: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    appearance: textfield;
}

.rep-input::-webkit-inner-spin-button,
.rep-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
}

/* Quiz type grid */
.quiz-type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.quiz-type-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--tile) 82%, transparent);
    cursor: pointer;
    gap: 4px;
    text-align: left;
    transition: all 0.2s ease;
}

.quiz-type-btn:hover {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
}

.quiz-type-btn.active {
    border-color: transparent;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    box-shadow: 0 8px 20px color-mix(in srgb, var(--primary) 28%, transparent);
}

.qt-label {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text);
    transition: color 0.2s;
}

.qt-desc {
    font-size: 0.72rem;
    color: var(--muted);
    line-height: 1.4;
    transition: color 0.2s;
}

.quiz-type-btn.active .qt-label,
.quiz-type-btn.active .qt-desc {
    color: #fff;
}

/* ── Navigation ── */
.step-nav {
    display: flex;
    gap: 10px;
    margin-top: 1.5rem;
}

.btn-back {
    padding: 13px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
}

.btn-back:hover {
    background: color-mix(in srgb, var(--tile) 80%, transparent);
    color: var(--text);
}

.btn-next {
    flex: 1;
    padding: 13px 20px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--primary) 50%, transparent);
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    color: var(--primary);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-next:hover:not(:disabled) {
    background: color-mix(in srgb, var(--primary) 18%, transparent);
    transform: translateX(2px);
}

.btn-next:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.arrow {
    transition: transform 0.18s ease;
}

.btn-next:hover:not(:disabled) .arrow {
    transform: translateX(4px);
}

.btn-start {
    flex: 1;
    padding: 14px 20px;
    font-size: 0.95rem;
    font-weight: 700;
    border-radius: 12px;
    border: none;
    background: linear-gradient(125deg, var(--primary), var(--secondary));
    color: #fff;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
        transform 0.22s ease,
        box-shadow 0.22s ease;
}

.btn-start::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: translateX(-120%);
}

.btn-start:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px color-mix(in srgb, var(--primary) 35%, transparent);
}

.btn-start:hover::after {
    animation: shimmer 0.7s ease;
}

@keyframes shimmer {
    to {
        transform: translateX(120%);
    }
}

/* ── Responsive ── */
@media (max-width: 600px) {
    .mode-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .mode-kana {
        font-size: 1.8rem;
    }

    .quiz-type-grid {
        grid-template-columns: 1fr;
    }

    .char-grid {
        grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    }
}
</style>
