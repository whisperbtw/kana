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
