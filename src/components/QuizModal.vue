<script setup lang="ts">
interface ModalButton {
  text: string
  type?: 'primary' | 'secondary'
  onClick?: () => void
}

defineProps<{
  open: boolean
  title: string
  content: string
  buttons: ModalButton[]
}>()

const emit = defineEmits<{
  action: [button: ModalButton]
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="emit('action', { text: 'dismiss', type: 'secondary' })"
    >
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-title">{{ title }}</div>
        <div class="modal-content" v-html="content" />
        <div class="modal-buttons">
          <button
            v-for="button in buttons"
            :key="button.text"
            type="button"
            class="modal-button"
            :class="button.type || 'secondary'"
            @click="emit('action', button)"
          >
            {{ button.text }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
