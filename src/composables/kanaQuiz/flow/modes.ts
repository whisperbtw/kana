import type { KanaChar } from '~/data/chars';
import type { QuizEntry, StudyCharStat } from '../core/types';
import { shuffle } from '../shared/utils';

export function buildReverseOptions(current: KanaChar, selectedCharsSession: KanaChar[]) {
    const wrongOptions: KanaChar[] = [];
    const availableChars = selectedCharsSession.filter((char) => char.char !== current.char);

    while (wrongOptions.length < 2 && availableChars.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        const wrongChar = availableChars[randomIndex];

        if (!wrongChar) {
            break;
        }

        if (!wrongOptions.find((char) => char.char === wrongChar.char) && wrongChar.romaji !== current.romaji) {
            wrongOptions.push(wrongChar);
        }

        availableChars.splice(randomIndex, 1);
    }

    return shuffle([current, ...wrongOptions]);
}

export function buildStudyOptions(current: KanaChar, selectedCharsSession: KanaChar[]) {
    const wrongOptions: KanaChar[] = [];
    const availableChars = selectedCharsSession.filter((char) => char.char !== current.char);

    while (wrongOptions.length < 3 && availableChars.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        const wrongChar = availableChars[randomIndex];

        if (!wrongChar) {
            break;
        }

        if (!wrongOptions.find((char) => char.romaji === wrongChar.romaji) && wrongChar.romaji !== current.romaji) {
            wrongOptions.push(wrongChar);
        }

        availableChars.splice(randomIndex, 1);
    }

    while (wrongOptions.length < 3 && availableChars.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableChars.length);
        const wrongChar = availableChars[randomIndex];

        if (!wrongChar) {
            break;
        }

        wrongOptions.push(wrongChar);
        availableChars.splice(randomIndex, 1);
    }

    return shuffle([current.romaji, ...wrongOptions.map((char) => char.romaji)]);
}

export function createComboQuizList(selectedCharsSession: KanaChar[], repetitionsPerChar: number) {
    const quizList: QuizEntry[] = [];

    for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar; repetitionIndex += 1) {
        const shuffledChars = shuffle([...selectedCharsSession]);

        for (let comboIndex = 0; comboIndex < shuffledChars.length; comboIndex += 3) {
            const combo = shuffledChars.slice(comboIndex, comboIndex + 3);

            if (combo.length === 3) {
                quizList.push(combo);
            }
        }
    }

    return quizList;
}

export function createStandardQuizList(selectedCharsSession: KanaChar[], repetitionsPerChar: number) {
    const quizList: QuizEntry[] = [];

    for (const char of selectedCharsSession) {
        for (let repetitionIndex = 0; repetitionIndex < repetitionsPerChar; repetitionIndex += 1) {
            quizList.push(char);
        }
    }

    return shuffle(quizList);
}

export function createStudyModeData(selectedCharsSession: KanaChar[]) {
    const stats: Record<string, StudyCharStat> = {};

    for (const char of selectedCharsSession) {
        stats[char.char] = {
            correct: 0,
            incorrect: 0,
            firstTime: true,
            teach: false,
        };
    }

    const studyOrder = shuffle([...selectedCharsSession]);
    const activeCharPool = studyOrder.slice(0, 4);

    return {
        stats,
        studyOrder,
        activeCharPool,
        quizList: shuffle([...activeCharPool]),
    };
}
