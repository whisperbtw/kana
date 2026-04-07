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

<style scoped>
.controls {
  background: linear-gradient(170deg, color-mix(in srgb, var(--card) 94%, #fff 6%), var(--card));
  padding: clamp(22px, 3.5vw, 34px);
  border-radius: 24px;
  box-shadow: 0 18px 38px var(--shadow);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.controls::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent);
  opacity: 0.6;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

select,
input[type='number'] {
  width: 100%;
  padding: 14px 15px;
  margin-bottom: 18px;
  font-size: 0.98rem;
  border: 1px solid var(--border);
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

select:focus,
input[type='number']:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--primary) 76%, transparent);
  box-shadow: 0 0 0 4px var(--focus);
  background: color-mix(in srgb, var(--tile) 92%, #fff 8%);
}

.sections {
  margin-top: 10px;
}

.section-title {
  font-size: 1.04rem;
  margin: 22px 0 12px;
  color: var(--text);
  padding-left: 12px;
  border-left: 3px solid var(--secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-controls {
  display: flex;
  gap: 8px;
}

.action-button,
.section-button {
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

.section-button {
  width: auto;
  padding: 6px 10px;
  font-size: 0.7rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--tile) 88%, transparent);
  color: var(--text);
  border: 1px solid var(--border);
}

.section-button:hover {
  background: linear-gradient(125deg, var(--primary), var(--secondary));
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.char-checkbox {
  position: relative;
}

.char-checkbox input[type='checkbox'] {
  position: absolute;
  opacity: 0;
}

.char-checkbox label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 62px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 1.55rem;
  font-family: 'Noto Sans JP', sans-serif;
  background: color-mix(in srgb, var(--tile) 84%, transparent);
  margin: 0;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.char-checkbox label:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--primary) 65%, var(--border));
}

.char-checkbox input:checked + label {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  box-shadow: 0 10px 20px color-mix(in srgb, var(--primary) 35%, transparent);
}

@media (max-width: 760px) {
  .controls {
    border-radius: 18px;
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
  }

  .action-button {
    font-size: 0.88rem;
    padding: 12px 14px;
  }
}
</style>
