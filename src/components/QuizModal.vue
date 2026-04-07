<script setup lang="ts">
interface ModalButton {
    text: string;
    type?: 'primary' | 'secondary';
    onClick?: () => void;
}

defineProps<{
    open: boolean;
    title: string;
    content: string;
    buttons: ModalButton[];
}>();

const emit = defineEmits<{
    action: [button: ModalButton];
}>();
</script>

<template>
    <Teleport to="body">
        <div v-if="open" class="modal-overlay" @click.self="emit('action', { text: 'dismiss', type: 'secondary' })">
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

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11, 11, 18, 0.66);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeInScale 0.24s ease-out;
}

.modal {
    background: color-mix(in srgb, var(--card) 96%, #fff 4%);
    padding: 36px 30px;
    border-radius: 22px;
    max-width: 520px;
    width: min(92vw, 520px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
    border: 1px solid var(--border);
}

.modal-title {
    font-size: 1.9rem;
    text-align: center;
    margin-bottom: 16px;
}

.modal-content {
    text-align: center;
    font-size: 1.04rem;
    line-height: 1.6;
    margin-bottom: 24px;
    color: var(--text);
}

.modal-content :deep(.stat-line) {
    margin: 8px 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.modal-buttons {
    display: flex;
    gap: 10px;
}

.modal-button {
    cursor: pointer;
    flex: 1;
    padding: 13px;
    font-size: 0.95rem;
    font-weight: 700;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: transform 0.2s ease;
}

.modal-button.primary {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: #fff;
}

.modal-button.secondary {
    background: color-mix(in srgb, var(--tile) 75%, transparent);
    color: var(--text);
    border-color: var(--border);
}

.modal-button:hover {
    transform: translateY(-2px);
}

@media (max-width: 430px) {
    .modal {
        padding: 28px 20px;
    }
}
</style>
