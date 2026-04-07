<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { KanaChar } from '~/data/chars'
import type { QuizMode, StudyPhase, TeachingTone } from '~/composables/useKanaQuiz'

const normalAnswer = defineModel<string>('normalAnswer', { required: true })
const comboAnswer = defineModel<string>('comboAnswer', { required: true })

defineProps<{
  questionVisible: boolean
  activeQuizMode: QuizMode
  currentCharText: string
  currentCombo: KanaChar[]
  currentRomajiText: string
  normalAnswerRef: ((element: Element | ComponentPublicInstance | null) => void) | null
  comboAnswerRef: ((element: Element | ComponentPublicInstance | null) => void) | null
  normalInputDisabled: boolean
  comboInputDisabled: boolean
  normalInputError: boolean
  comboInputError: boolean
  reverseLocked: boolean
  reverseOptions: KanaChar[]
  studyOptions: string[]
  studyPhase: StudyPhase
  studyTeachingPrefix: string
  studyTeachingValue: string
  studyTeachingTone: TeachingTone
  getReverseOptionState: (option: KanaChar) => string
  getStudyOptionState: (option: string) => string
}>()

const emit = defineEmits<{
  submitNormal: []
  submitCombo: []
  selectReverseOption: [option: KanaChar]
  selectStudyOption: [option: string]
}>()
</script>

<template>
  <div v-if="questionVisible && activeQuizMode === 'normal'">
    <div class="char">{{ currentCharText }}</div>
    <input
      :ref="normalAnswerRef || undefined"
      v-model="normalAnswer"
      type="text"
      placeholder="Digite o romaji"
      autocomplete="off"
      :disabled="normalInputDisabled"
      :class="{ 'is-error': normalInputError }"
      @keydown.enter.prevent="emit('submitNormal')"
    >
    <button type="button" class="action-button" :disabled="normalInputDisabled" @click="emit('submitNormal')">
      Confirmar
    </button>
  </div>

  <div v-else-if="questionVisible && activeQuizMode === 'reverse'">
    <div class="romaji-display">{{ currentRomajiText }}</div>
    <div class="char-options">
      <button
        v-for="option in reverseOptions"
        :key="option.char"
        type="button"
        class="char-option"
        :class="getReverseOptionState(option)"
        :disabled="reverseLocked"
        @click="emit('selectReverseOption', option)"
      >
        {{ option.char }}
      </button>
    </div>
  </div>

  <div v-else-if="questionVisible && activeQuizMode === 'combo'">
    <div class="combo-chars">
      <span v-for="option in currentCombo" :key="option.char">{{ option.char }}</span>
    </div>
    <input
      :ref="comboAnswerRef || undefined"
      v-model="comboAnswer"
      type="text"
      placeholder="Digite o romaji dos caracteres"
      autocomplete="off"
      :disabled="comboInputDisabled"
      :class="{ 'is-error': comboInputError }"
      @keydown.enter.prevent="emit('submitCombo')"
    >
    <button type="button" class="action-button" :disabled="comboInputDisabled" @click="emit('submitCombo')">
      Confirmar
    </button>
  </div>

  <div v-else-if="questionVisible && activeQuizMode === 'study'">
    <div class="study-teaching">
      <strong>{{ studyTeachingPrefix }}</strong>
      <span
        v-if="studyTeachingValue"
        class="study-teaching-value"
        :class="`tone-${studyTeachingTone}`"
      >
        {{ studyTeachingValue }}
      </span>
    </div>

    <div class="study-char">{{ currentCharText }}</div>

    <div class="study-options">
      <button
        v-for="option in studyOptions"
        :key="option"
        type="button"
        class="study-option"
        :class="[getStudyOptionState(option), { 'full-span': studyPhase === 'first' }]"
        @click="emit('selectStudyOption', option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type='text'] {
  width: 100%;
  padding: 14px 15px;
  margin-bottom: 18px;
  text-align: center;
  font-size: 1.18rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--tile) 82%, transparent);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease;
}

input[type='text']:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--primary) 76%, transparent);
  box-shadow: 0 0 0 4px var(--focus);
  background: color-mix(in srgb, var(--tile) 92%, #fff 8%);
}

input.is-error {
  border-color: var(--error);
  background: rgba(239, 71, 111, 0.1);
}

.action-button,
.char-option,
.study-option {
  cursor: pointer;
}

.action-button {
  width: 100%;
  padding: 14px 16px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  background: linear-gradient(125deg, var(--primary), var(--secondary));
  color: #fff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  transition: transform 0.22s ease;
}

.action-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-120%);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px color-mix(in srgb, var(--primary) 32%, transparent);
}

.action-button:hover::after {
  animation: shimmer 0.75s ease;
}

.action-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.char,
.study-char,
.combo-chars {
  text-align: center;
  margin: 20px 0 24px;
  font-family: 'Noto Sans JP', sans-serif;
  animation: fadeInScale 0.36s ease;
}

.char {
  font-size: clamp(4.4rem, 11vw, 7.2rem);
}

.study-char {
  font-size: clamp(4.1rem, 10vw, 6.2rem);
}

.combo-chars {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: clamp(3rem, 8.8vw, 4.8rem);
}

.romaji-display {
  font-size: clamp(2.6rem, 8vw, 5rem);
  text-align: center;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--primary);
  animation: fadeInScale 0.34s ease;
}

.char-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 470px;
  margin: 0 auto 24px;
}

.char-option {
  padding: 22px 14px;
  border: 2px solid var(--border);
  border-radius: 16px;
  text-align: center;
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-family: 'Noto Sans JP', sans-serif;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
  background: color-mix(in srgb, var(--tile) 88%, transparent);
  color: var(--text);
}

.char-option:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--primary) 75%, var(--border));
  box-shadow: 0 10px 22px var(--shadow);
}

.char-option.correct,
.study-option.correct {
  background: var(--success);
  color: #fff;
  border-color: var(--success);
  animation: correctPulse 0.38s ease-out;
}

.char-option.wrong,
.study-option.wrong {
  background: var(--error);
  color: #fff;
  border-color: var(--error);
  animation: shake 0.38s ease-out;
}

.char-option.disabled,
.study-option.disabled {
  pointer-events: none;
  opacity: 0.55;
}

.study-teaching {
  font-size: 1.02rem;
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(75, 85, 99, 0.14), rgba(123, 135, 148, 0.16));
  border-radius: 14px;
  margin-bottom: 18px;
  border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
  font-weight: 700;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: riseIn 0.3s ease;
}

.study-teaching-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.study-teaching-value.tone-primary {
  color: var(--primary);
}

.study-teaching-value.tone-success {
  color: var(--success);
}

.study-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 470px;
  margin: 0 auto;
}

.study-option {
  padding: 18px 14px;
  border: 2px solid var(--border);
  border-radius: 14px;
  text-align: center;
  font-size: 1.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
  background: color-mix(in srgb, var(--tile) 88%, transparent);
  color: var(--text);
}

.study-option:hover:not(.disabled) {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--primary) 72%, var(--border));
  box-shadow: 0 10px 22px var(--shadow);
}

.study-option.full-span {
  grid-column: span 2;
  font-size: 1.2rem;
}

@media (max-width: 600px) {
  .char-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .study-options {
    grid-template-columns: 1fr;
  }

  .study-option.full-span {
    grid-column: auto;
  }

  .action-button {
    font-size: 0.88rem;
    padding: 12px 14px;
  }
}
</style>
