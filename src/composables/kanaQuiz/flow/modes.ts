import type { KanaChar } from '~/data/chars';
import type {
    ComboQuizQuestion,
    QuizQuestion,
    SingleQuizMode,
} from '../core/types';
import { shuffle } from '../shared/utils';

function takeDistinctRomaji(candidates: KanaChar[], count: number) {
    const seen = new Set<string>();
    const result: KanaChar[] = [];

    for (const candidate of shuffle([...candidates])) {
        if (seen.has(candidate.romaji)) continue;
        seen.add(candidate.romaji);
        result.push(candidate);
        if (result.length === count) break;
    }

    return result;
}

export function buildReverseOptions(current: KanaChar, selectedCharsSession: KanaChar[]) {
    const wrongOptions = takeDistinctRomaji(
        selectedCharsSession.filter((char) => char.char !== current.char && char.romaji !== current.romaji),
        2,
    );

    return shuffle([current, ...wrongOptions]);
}

export function createComboQuizList(selectedCharsSession: KanaChar[], repetitionsPerChar: number) {
    const quizList: ComboQuizQuestion[] = [];

    for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar; repetitionIndex += 1) {
        const shuffledChars = shuffle([...selectedCharsSession]);

        for (let comboIndex = 0; comboIndex < shuffledChars.length; comboIndex += 3) {
            const combo = shuffledChars.slice(comboIndex, comboIndex + 3);
            if (combo.length < 3) {
                combo.push(...shuffledChars.filter((char) => !combo.includes(char)).slice(0, 3 - combo.length));
            }

            if (combo.length === 3) quizList.push({ mode: 'combo', chars: [combo[0]!, combo[1]!, combo[2]!] });
        }
    }

    return shuffle(quizList);
}

export function createStandardQuizList(
    selectedCharsSession: KanaChar[],
    repetitionsPerChar: number,
    mode: Exclude<SingleQuizMode, 'study'>,
) {
    const quizList: QuizQuestion[] = [];

    for (const char of selectedCharsSession) {
        for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar; repetitionIndex += 1) {
            quizList.push({ mode, char });
        }
    }

    return shuffle(quizList);
}
