import { ref, shallowRef } from 'vue';
import type { FeedbackKind, ModalButton, ModalState } from '../core/types';
import { getTimerText } from './timer';

export function useKanaQuizRuntime() {
    const timerText = ref('\u23F1\uFE0F 00:00');
    const startTime = ref<number | null>(null);

    const feedback = ref<FeedbackKind | null>(null);
    const modal = shallowRef<ModalState | null>(null);

    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let preStartCountdownInterval: ReturnType<typeof setInterval> | null = null;
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
    let feedbackSequence = 0;

    function updateTimer() {
        timerText.value = getTimerText(startTime.value);
    }

    function stopTimer() {
        if (!timerInterval) return;
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function stopPreStartCountdown() {
        if (!preStartCountdownInterval) return;
        clearInterval(preStartCountdownInterval);
        preStartCountdownInterval = null;
    }

    function scheduleTask(callback: () => void, delayMs: number) {
        const timeoutId = setTimeout(() => {
            pendingTimeouts.delete(timeoutId);
            callback();
        }, delayMs);

        pendingTimeouts.add(timeoutId);
    }

    function clearPendingTimeouts() {
        for (const timeoutId of pendingTimeouts) {
            clearTimeout(timeoutId);
        }

        pendingTimeouts.clear();
    }

    function resetFeedback() {
        feedbackSequence += 1;
        feedback.value = null;
    }

    function showModal(state: ModalState) {
        modal.value = state;
    }

    function handleModalAction(button: ModalButton) {
        modal.value = null;
        button.onClick?.();
    }

    function dismissModal() {
        if (modal.value?.dismissible) modal.value = null;
    }

    function showFeedback(isCorrect: boolean) {
        const sequence = ++feedbackSequence;
        feedback.value = isCorrect ? 'correct' : 'wrong';

        scheduleTask(() => {
            if (sequence === feedbackSequence) feedback.value = null;
        }, 500);
    }

    function startRoundWithCountdown(onCountdownComplete: () => void) {
        stopTimer();
        stopPreStartCountdown();

        let remainingSeconds = 3;
        timerText.value = `\u23F3 ${remainingSeconds}s`;

        preStartCountdownInterval = setInterval(() => {
            remainingSeconds -= 1;

            if (remainingSeconds <= 0) {
                stopPreStartCountdown();
                startTime.value = Date.now();
                updateTimer();
                timerInterval = setInterval(updateTimer, 1000);
                onCountdownComplete();
                return;
            }

            timerText.value = `\u23F3 ${remainingSeconds}s`;
        }, 1000);
    }

    function resetRuntimeState() {
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();
        resetFeedback();
        modal.value = null;
        startTime.value = null;
        timerText.value = '\u23F1\uFE0F 00:00';
    }

    function cleanupRuntime() {
        stopTimer();
        stopPreStartCountdown();
        clearPendingTimeouts();
    }

    return {
        cleanupRuntime,
        clearPendingTimeouts,
        dismissModal,
        feedback,
        handleModalAction,
        modal,
        resetFeedback,
        resetRuntimeState,
        scheduleTask,
        showFeedback,
        showModal,
        startRoundWithCountdown,
        startTime,
        stopPreStartCountdown,
        stopTimer,
        timerText,
        updateTimer,
    };
}
