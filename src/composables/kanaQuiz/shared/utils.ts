import type { PersistedStats } from '../core/types'

export function shuffle<T>(items: T[]) {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const currentItem = items[index];
        const randomItem = items[randomIndex];

        if (currentItem === undefined || randomItem === undefined) {
            continue;
        }

        items[index] = randomItem;
        items[randomIndex] = currentItem;
    }

    return items;
}

export function createDefaultStats(): PersistedStats {
    return {
        hits: 0,
        miss: 0,
        perKana: {},
    };
}
