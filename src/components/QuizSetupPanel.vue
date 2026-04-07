<script setup lang="ts">
import type { KanaMode, QuizMode, QuizSection } from '~/composables/useKanaQuiz'

const mode = defineModel<KanaMode>('mode', { required: true })
const quizType = defineModel<QuizMode>('quizType', { required: true })
const repeat = defineModel<number>('repeat', { required: true })
const selectedCharIds = defineModel<number[]>('selectedCharIds', { required: true })

defineProps<{
  sections: QuizSection[]
  setSectionSelection: (indices: number[], checked: boolean) => void
  startQuiz: () => void
}>()
</script>

<template>
  <section class="controls">
    <label for="study-mode">Modo de estudo</label>
    <select id="study-mode" v-model="mode">
      <option value="all">Hiragana + Katakana</option>
      <option value="hira">Só Hiragana</option>
      <option value="kata">Só Katakana</option>
    </select>

    <label for="quiz-type">Tipo de quiz</label>
    <select id="quiz-type" v-model="quizType">
      <option value="normal">Normal (ver caractere e digitar romaji)</option>
      <option value="reverse">Reverso (ver romaji e clicar no caractere)</option>
      <option value="combo">Combo (ver 3 caracteres e digitar junto)</option>
      <option value="study">Estudo (aprender e praticar)</option>
    </select>

    <label for="repeat">Repetições por caractere</label>
    <input id="repeat" v-model.number="repeat" type="number" min="1" max="10">

    <div class="sections">
      <template v-for="section in sections" :key="section.title">
        <div class="section-title">
          <span>{{ section.title }}</span>

          <div class="section-controls">
            <button
              type="button"
              class="section-button"
              @click="setSectionSelection(section.chars.map((char) => char.index), true)"
            >
              Todos
            </button>
            <button
              type="button"
              class="section-button"
              @click="setSectionSelection(section.chars.map((char) => char.index), false)"
            >
              Nenhum
            </button>
          </div>
        </div>

        <div class="grid">
          <div v-for="char in section.chars" :key="char.index" class="char-checkbox">
            <input
              :id="`char-${char.index}`"
              v-model="selectedCharIds"
              type="checkbox"
              :value="char.index"
            >
            <label :for="`char-${char.index}`">{{ char.char }}</label>
          </div>
        </div>
      </template>
    </div>

    <button type="button" class="action-button" @click="startQuiz">Começar quiz</button>
  </section>
</template>
