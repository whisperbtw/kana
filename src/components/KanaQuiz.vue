<script setup lang="ts">
useHead({
  title: 'Kana Quiz',
})

const {
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
} = useKanaQuiz()
</script>

<template>
  <div class="container">
    <header class="app-header">
      <h1>かな Quiz</h1>
      <p class="subtitle">Treine hiragana e katakana com foco em velocidade e memória.</p>

      <section class="profile-card" aria-label="Perfil de nível">
        <div class="profile-top">
          <div class="profile-level">Nível <span>{{ profile.level }}</span></div>
          <div class="profile-rank">{{ profile.rank }}</div>
        </div>

        <div class="xp-track">
          <div class="xp-fill" :style="{ width: `${profileProgress}%` }" />
        </div>

        <div class="profile-meta">
          <span>{{ profile.xp }} / {{ profileXpRequired }} XP</span>
          <span>Total: {{ profile.totalXp }} XP</span>
        </div>
      </section>
    </header>

    <button type="button" class="theme-toggle floating-icon-button" aria-label="Alternar tema" @click="toggleTheme">
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
      class="exit-btn floating-icon-button"
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
      class="restart-btn floating-icon-button"
      aria-label="Reiniciar quiz"
      @click="confirmRestartQuiz"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path
          d="M224,128a8,8,0,0,1-8,8H139.31l26.35,26.34a8,8,0,0,1-11.32,11.32l-40-40a8,8,0,0,1,0-11.32l40-40a8,8,0,0,1,11.32,11.32L139.31,120H216A8,8,0,0,1,224,128ZM112,48a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8v62.06a8,8,0,0,0,16,0V48Z"
        />
      </svg>
    </button>

    <main class="app-main">
      <section v-if="!quizStarted" class="controls">
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

      <section v-else class="quiz">
        <div class="progress">{{ progressText }}</div>
        <div class="timer">{{ timerText }}</div>

        <div v-if="questionVisible && activeQuizMode === 'normal'">
          <div class="char">{{ currentCharText }}</div>
          <input
            ref="normalAnswerRef"
            v-model="normalAnswer"
            type="text"
            placeholder="Digite o romaji"
            autocomplete="off"
            :disabled="normalInputDisabled"
            :class="{ 'is-error': normalInputError }"
            @keydown.enter.prevent="submitAnswer"
          >
          <button type="button" class="action-button" :disabled="normalInputDisabled" @click="submitAnswer">
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
              @click="checkReverseAnswer(option)"
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
            ref="comboAnswerRef"
            v-model="comboAnswer"
            type="text"
            placeholder="Digite o romaji dos caracteres"
            autocomplete="off"
            :disabled="comboInputDisabled"
            :class="{ 'is-error': comboInputError }"
            @keydown.enter.prevent="submitComboAnswer"
          >
          <button type="button" class="action-button" :disabled="comboInputDisabled" @click="submitComboAnswer">
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
              @click="handleStudyOption(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div class="feedback" :class="{ show: feedbackVisible }">{{ feedbackIcon }}</div>

  <QuizModal
    :open="modalOpen"
    :title="modalTitle"
    :content="modalContent"
    :buttons="modalButtons"
    @action="handleModalAction"
  />
</template>
