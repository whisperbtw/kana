import type { KanaChar } from '~/data/chars';
import type { StudyCharStat, StudyPhase, TeachingTone } from '../core/types';

type StudyQuestionState = {
    phase: StudyPhase;
    prefix: string;
    value: string;
    tone: TeachingTone;
    options: string[];
};

export function getStudyProgress(
    selectedCharsSession: KanaChar[],
    studyCharStats: Record<string, StudyCharStat>,
    repetitionsPerChar: number,
) {
    const completed = selectedCharsSession.filter((char) => {
        return (studyCharStats[char.char]?.correct ?? 0) >= repetitionsPerChar;
    }).length;

    return {
        completed,
        total: selectedCharsSession.length,
    };
}

export function isStudyComplete(
    selectedCharsSession: KanaChar[],
    studyCharStats: Record<string, StudyCharStat>,
    repetitionsPerChar: number,
) {
    return selectedCharsSession.every((char) => {
        return (studyCharStats[char.char]?.correct ?? 0) >= repetitionsPerChar;
    });
}

export function unlockNextStudyCharIfNeeded(params: {
    blockTeachingPhase: boolean
    studyOrder: KanaChar[]
    activeCharPool: KanaChar[]
    studyCharStats: Record<string, StudyCharStat>
    repetitionsPerChar: number
}) {
    if (params.blockTeachingPhase) {
        return params.activeCharPool;
    }

    const nextChar = params.studyOrder.find((char) => {
        return (
            !params.activeCharPool.some((activeChar) => activeChar.char === char.char) &&
            (params.studyCharStats[char.char]?.correct ?? 0) < params.repetitionsPerChar
        );
    });

    return nextChar ? [...params.activeCharPool, nextChar] : params.activeCharPool;
}

export function createStudyQuestionState(params: {
    current: KanaChar
    stats: StudyCharStat
    options: string[]
}) : StudyQuestionState {
    if (params.stats.firstTime) {
        return {
            phase: 'first',
            prefix: 'Aprenda:',
            value: params.current.romaji,
            tone: 'primary',
            options: ['Entendi'],
        };
    }

    if (params.stats.teach) {
        return {
            phase: 'relearn',
            prefix: 'Reaprendendo:',
            value: params.current.romaji,
            tone: 'success',
            options: params.options,
        };
    }

    return {
        phase: 'practice',
        prefix: 'Pr\u00E1tica',
        value: '',
        tone: 'primary',
        options: params.options,
    };
}
