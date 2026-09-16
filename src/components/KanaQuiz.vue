<script setup lang="ts">
import { useHead } from '#imports';
import { useKanaQuiz } from '~/composables/useKanaQuiz';

useHead({
    title: 'Kana Quiz',
});

const {
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
} = useKanaQuiz();

function setNormalAnswerRef(element: Element | { $el?: Element } | null) {
    normalAnswerRef.value = element instanceof HTMLInputElement ? element : null;
}

function setComboAnswerRef(element: Element | { $el?: Element } | null) {
    comboAnswerRef.value = element instanceof HTMLInputElement ? element : null;
}
</script>

<template>
    <div class="container">
        <header class="app-header">
            <h1><span class="jp-text" lang="ja">かな</span> Quiz</h1>
            <p class="subtitle">Treine hiragana e katakana com foco em velocidade e memória.</p>
        </header>

        <div class="quiz-actions">
        <button type="button" class="theme-toggle quiz-action-button" aria-label="Alternar tema" @click="toggleTheme">
            <svg
                v-if="!isDark"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
            >
                <path
                    d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56A104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"
                />
            </svg>

            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
            >
                <path
                    d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"
                />
            </svg>
        </button>

        <button
            v-if="quizStarted"
            type="button"
            class="exit-btn quiz-action-button"
            aria-label="Sair do quiz"
            @click="confirmExitQuiz"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path
                    d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"
                />
            </svg>
        </button>

        <button
            v-if="quizStarted"
            type="button"
            class="restart-btn quiz-action-button"
            aria-label="Reiniciar quiz"
            @click="confirmRestartQuiz"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path
                    d="M224,128a8,8,0,0,1-8,8H139.31l26.35,26.34a8,8,0,0,1-11.32,11.32l-40-40a8,8,0,0,1,0-11.32l40-40a8,8,0,0,1,11.32,11.32L139.31,120H216A8,8,0,0,1,224,128ZM112,48a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8v62.06a8,8,0,0,0,16,0V48Z"
                />
            </svg>
        </button>
        </div>

        <main class="app-main">
            <QuizSetupPanel
                v-if="!quizStarted"
                v-model:mode="mode"
                v-model:quiz-type="quizType"
                v-model:repeat="repeat"
                v-model:selected-char-ids="selectedCharIds"
                :sections="sections"
                @set-section-selection="setSectionSelection"
                @start-quiz="startQuiz"
            />

            <section v-else class="quiz">
                <QuizStatusBar :progress-text="progressText" :timer-text="timerText" />

                <div class="feedback-slot" role="status" aria-live="polite">
                    <div v-if="feedback" class="answer-feedback" :class="feedback">
                        <svg v-if="feedback === 'correct'" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m5 12 4 4L19 6" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7 7l10 10M17 7 7 17" />
                        </svg>
                        <span>{{ feedback === 'correct' ? 'Resposta correta' : 'Resposta incorreta' }}</span>
                    </div>
                </div>

                <QuizQuestionPanel
                    v-model:normal-answer="normalAnswer"
                    v-model:combo-answer="comboAnswer"
                    :question-visible="questionVisible"
                    :active-quiz-mode="activeQuizMode"
                    :current-char-text="currentCharText"
                    :current-combo="currentCombo"
                    :current-romaji-text="currentRomajiText"
                    :normal-answer-ref="setNormalAnswerRef"
                    :combo-answer-ref="setComboAnswerRef"
                    :normal-answer-state="normalAnswerState"
                    :combo-answer-state="comboAnswerState"
                    :reverse-locked="reverseLocked"
                    :reverse-options="reverseOptions"
                    :study-options="studyOptions"
                    :study-phase="studyPhase"
                    :study-teaching-prefix="studyTeachingPrefix"
                    :study-teaching-value="studyTeachingValue"
                    :study-teaching-tone="studyTeachingTone"
                    :get-reverse-option-state="getReverseOptionState"
                    :get-study-option-state="getStudyOptionState"
                    @submit-normal="submitAnswer"
                    @submit-combo="submitComboAnswer"
                    @select-reverse-option="checkReverseAnswer"
                    @select-study-option="handleStudyOption"
                />
            </section>
        </main>
    </div>

    <QuizModal
        :modal="modal"
        @action="handleModalAction"
        @close="dismissModal"
    />
</template>

<style scoped>
.container {
    max-width: 760px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    animation: riseIn 0.55s ease both;
}

.app-header {
    margin-bottom: 16px;
}

.app-main {
    display: grid;
    gap: 16px;
}

h1 {
    text-align: center;
    font-size: clamp(2.2rem, 5vw, 3.35rem);
    margin-bottom: 10px;
    font-weight: 700;
    letter-spacing: -0.04em;
    background: linear-gradient(130deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
}

.jp-text {
    font-family: 'Noto Sans JP', sans-serif;
}

.subtitle {
    text-align: center;
    max-width: 560px;
    margin: 0 auto 22px;
    color: var(--muted);
    font-size: 0.94rem;
    line-height: 1.55;
}

.quiz-actions {
    position: fixed;
    top: 18px;
    right: 18px;
    display: flex;
    gap: 8px;
    z-index: 100;
}

.quiz-action-button {
    width: 48px;
    height: 48px;
    padding: 11px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: color-mix(in srgb, var(--tile) 96%, #fff 4%);
    color: var(--text);
    cursor: pointer;
    transition:
        transform 0.25s ease,
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        background-color 0.25s ease,
        color 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 24px var(--shadow);
}

.quiz-action-button svg {
    width: 23px;
    height: 23px;
}

.quiz-action-button:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--primary) 56%, var(--border));
    box-shadow: 0 14px 30px var(--shadow);
}

.quiz-action-button:active {
    transform: translateY(0);
}

.exit-btn:hover {
    color: #fff;
    background: linear-gradient(145deg, var(--error), color-mix(in srgb, var(--error) 70%, #3a3033));
    border-color: transparent;
}

.restart-btn:hover {
    color: #fff;
    background: linear-gradient(145deg, var(--secondary), color-mix(in srgb, var(--secondary) 72%, #2f3a48));
    border-color: transparent;
}

.quiz {
    background: linear-gradient(170deg, color-mix(in srgb, var(--card) 94%, #fff 6%), var(--card));
    padding: clamp(22px, 3.5vw, 34px);
    border-radius: 24px;
    box-shadow: 0 18px 38px var(--shadow);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    animation: riseIn 0.4s ease both;
}

.quiz::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent);
    opacity: 0.6;
}

.feedback-slot {
    min-height: 42px;
    display: flex;
    justify-content: center;
    margin: -6px 0 4px;
}

.answer-feedback {
    min-width: 190px;
    height: 38px;
    padding: 0 14px;
    border: 1px solid currentColor;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 700;
}

.answer-feedback svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.answer-feedback.correct {
    color: var(--success);
    background: color-mix(in srgb, var(--success) 11%, transparent);
}

.answer-feedback.wrong {
    color: var(--error);
    background: color-mix(in srgb, var(--error) 11%, transparent);
}

@media (max-width: 760px) {
    .quiz-actions {
        position: static;
        justify-content: flex-end;
        margin-bottom: 12px;
    }

    .container {
        max-width: 95vw;
    }

    .quiz {
        border-radius: 18px;
    }
}

@media (max-width: 600px) {
    .subtitle {
        font-size: 0.86rem;
        margin-bottom: 18px;
    }
}

@media (max-width: 430px) {
    .quiz-action-button {
        width: 44px;
        height: 44px;
        padding: 10px;
    }
}
</style>
