import { ref } from 'vue';
import type { ModalButton } from '../core/types';
import { getTimerText } from './timer';

export function useKanaQuizRuntime() {
    const timerText = ref('\u23F1\uFE0F 00:00');
    const startTime = ref<number | null>(null);

    const feedbackVisible = ref(false);
    const feedbackIcon = ref('');

    const modalOpen = ref(false);
    const modalTitle = ref('');
    const modalContent = ref('');
    const modalButtons = ref<ModalButton[]>([]);

    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let preStartCountdownInterval: ReturnType<typeof setInterval> | null = null;
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

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
        feedbackVisible.value = false;
        feedbackIcon.value = '';
    }

    function showModal(title: string, content: string, buttons: ModalButton[]) {
        modalTitle.value = title;
        modalContent.value = content;
        modalButtons.value = buttons;
        modalOpen.value = true;
    }

    function handleModalAction(button: ModalButton) {
        modalOpen.value = false;
        modalTitle.value = '';
        modalContent.value = '';
        modalButtons.value = [];

        if (button.text !== 'dismiss') {
            button.onClick?.();
        }
    }

    function showFeedback(isCorrect: boolean) {
        feedbackIcon.value = isCorrect ? '\u2705' : '\u274C';
        feedbackVisible.value = true;

        scheduleTask(() => {
            feedbackVisible.value = false;
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
        feedbackIcon,
        feedbackVisible,
        handleModalAction,
        modalButtons,
        modalContent,
        modalOpen,
        modalTitle,
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
