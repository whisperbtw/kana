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
