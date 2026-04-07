<script setup lang="ts">
defineProps<{
  progressText: string
  timerText: string
}>()
</script>

<template>
  <div class="progress">{{ progressText }}</div>
  <div class="timer">{{ timerText }}</div>
</template>

<style scoped>
.progress {
  text-align: center;
  font-size: 0.84rem;
  color: var(--muted);
  margin-bottom: 10px;
  font-family: 'JetBrains Mono', monospace;
}

.timer {
  text-align: center;
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 18px;
  font-family: 'JetBrains Mono', monospace;
}
</style>
