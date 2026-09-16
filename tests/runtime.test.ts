import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKanaQuizRuntime } from '../src/composables/kanaQuiz/flow/runtime';

afterEach(() => {
    vi.useRealTimers();
});

describe('quiz runtime', () => {
    it('does not let an older timeout hide newer feedback', () => {
        vi.useFakeTimers();
        const runtime = useKanaQuizRuntime();

        runtime.showFeedback(true);
        vi.advanceTimersByTime(300);
        runtime.showFeedback(false);
        vi.advanceTimersByTime(200);
        expect(runtime.feedback.value).toBe('wrong');

        vi.advanceTimersByTime(300);
        expect(runtime.feedback.value).toBeNull();
    });

    it('only dismisses modals that explicitly allow it', () => {
        const runtime = useKanaQuizRuntime();
        const baseModal = {
            title: 'Resultado',
            content: { kind: 'text' as const, text: 'Fim' },
            buttons: [],
        };

        runtime.showModal({ ...baseModal, dismissible: false });
        runtime.dismissModal();
        expect(runtime.modal.value).not.toBeNull();

        runtime.showModal({ ...baseModal, dismissible: true });
        runtime.dismissModal();
        expect(runtime.modal.value).toBeNull();
    });
});
