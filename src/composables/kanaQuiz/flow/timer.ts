export function getElapsedTimeText(startTime: number | null) {
    if (!startTime) return '0min 0s';

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `${minutes}min ${seconds}s`;
}

export function getTimerText(startTime: number | null) {
    if (!startTime) {
        return '\u23F1\uFE0F 00:00';
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `\u23F1\uFE0F ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
