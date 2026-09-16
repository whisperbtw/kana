<script setup lang="ts">
import type { ModalButton, ModalState } from '~/composables/kanaQuiz/core/types';

defineProps<{
    modal: ModalState | null;
}>();

const emit = defineEmits<{
    action: [button: ModalButton];
    close: [];
}>();
</script>

<template>
    <Teleport to="body">
        <div v-if="modal" class="modal-overlay" @click.self="emit('close')">
            <div class="modal" role="dialog" aria-modal="true" :aria-label="modal.title">
                <div class="modal-title">{{ modal.title }}</div>
                <div v-if="modal.content.kind === 'text'" class="modal-content">{{ modal.content.text }}</div>
                <div v-else class="modal-content summary-content">
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <span>Tempo</span>
                            <strong>{{ modal.content.elapsed }}</strong>
                        </div>
                        <div class="summary-stat success">
                            <span>Acertos</span>
                            <strong>{{ modal.content.hits }}</strong>
                        </div>
                        <div class="summary-stat error">
                            <span>Erros</span>
                            <strong>{{ modal.content.misses }}</strong>
                        </div>
                    </div>

                    <div v-if="modal.content.mastery" class="summary-section">
                        <span class="summary-label">Domínio no estudo</span>
                        <strong class="mastery-value">
                            {{ modal.content.mastery.mastered }} de {{ modal.content.mastery.total }} caracteres
                        </strong>
                    </div>

                    <div v-if="modal.content.reviewItems.length" class="summary-section">
                        <span class="summary-label">Precisam de revisão</span>
                        <div class="review-list">
                            <span v-for="item in modal.content.reviewItems" :key="item.char" class="review-item">
                                <strong>{{ item.char }}</strong>
                                <span>{{ item.romaji }}</span>
                                <small>{{ item.misses }} {{ item.misses === 1 ? 'erro' : 'erros' }}</small>
                            </span>
                        </div>
                    </div>

                    <div v-if="modal.content.confusions.length" class="summary-section">
                        <span class="summary-label">Confusões frequentes</span>
                        <div class="confusion-list">
                            <span v-for="item in modal.content.confusions" :key="`${item.char}-${item.selected}`">
                                <strong>{{ item.char }}</strong> era <strong>{{ item.expected }}</strong>, respondido
                                como <strong>{{ item.selected }}</strong> ({{ item.count }}×)
                            </span>
                        </div>
                    </div>

                    <p v-if="!modal.content.reviewItems.length" class="summary-perfect">
                        Nenhum caractere ficou pendente para revisão.
                    </p>
                </div>
                <div class="modal-buttons">
                    <button
                        v-for="button in modal.buttons"
                        :key="button.label"
                        type="button"
                        class="modal-button"
                        :class="button.variant || 'secondary'"
                        @click="emit('action', button)"
                    >
                        {{ button.label }}
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
}

.modal {
    background: color-mix(in srgb, var(--card) 96%, #fff 4%);
    padding: 36px 30px;
    border-radius: 22px;
    max-width: 520px;
    width: min(92vw, 520px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
    border: 1px solid var(--border);
    max-height: min(88vh, 720px);
    overflow-y: auto;
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

.summary-content {
    text-align: left;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.summary-stat {
    padding: 12px 8px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--tile) 82%, transparent);
    text-align: center;
}

.summary-stat span,
.summary-label {
    display: block;
    color: var(--muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.summary-stat strong {
    display: block;
    margin-top: 3px;
    font-size: 1.12rem;
}

.summary-stat.success strong {
    color: var(--success);
}

.summary-stat.error strong {
    color: var(--error);
}

.summary-section {
    margin-top: 18px;
}

.mastery-value {
    display: block;
    margin-top: 5px;
}

.review-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 8px;
}

.review-item {
    display: grid;
    grid-template-columns: auto auto;
    align-items: baseline;
    gap: 0 6px;
    padding: 7px 10px;
    border: 1px solid color-mix(in srgb, var(--error) 30%, var(--border));
    border-radius: 10px;
    background: color-mix(in srgb, var(--error) 7%, transparent);
}

.review-item strong {
    font-family: 'Noto Sans JP', sans-serif;
}

.review-item small {
    grid-column: span 2;
    color: var(--muted);
    font-size: 0.64rem;
}

.confusion-list {
    display: grid;
    gap: 5px;
    margin-top: 8px;
    font-size: 0.76rem;
    line-height: 1.45;
}

.summary-perfect {
    margin: 18px 0 0;
    color: var(--success);
    font-size: 0.8rem;
    text-align: center;
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

    .modal-buttons {
        flex-direction: column-reverse;
    }
}
</style>
