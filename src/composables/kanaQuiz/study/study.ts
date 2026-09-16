import type { KanaChar } from '~/data/chars';
import type {
    StudyCard,
    StudyPhase,
    StudySession,
    StudyStrength,
    TeachingTone,
} from '../core/types';
import { shuffle } from '../shared/utils';

const ACTIVE_CARD_LIMIT = 3;
const CORRECT_PROGRESS: Record<StudyStrength, Pick<StudyCard, 'stage' | 'strength'> & { interval: number }> = {
    0: { stage: 'learning', strength: 1, interval: 2 },
    1: { stage: 'review', strength: 2, interval: 4 },
    2: { stage: 'review', strength: 3, interval: 8 },
    3: { stage: 'mastered', strength: 4, interval: Number.POSITIVE_INFINITY },
    4: { stage: 'mastered', strength: 4, interval: Number.POSITIVE_INFINITY },
};
const INCORRECT_STRENGTH: Record<StudyStrength, StudyStrength> = {
    0: 0,
    1: 0,
    2: 0,
    3: 1,
    4: 2,
};

type StudyQuestionState = {
    phase: StudyPhase;
    prefix: string;
    value: string;
    tone: TeachingTone;
    options: string[];
};

function updateCard(session: StudySession, char: string, update: (card: StudyCard) => StudyCard): StudySession {
    return {
        ...session,
        cards: session.cards.map((card) => card.kana.char === char ? update(card) : card),
        lastChar: char,
        questionNumber: session.questionNumber + 1,
    };
}

function prioritizeCards(cards: StudyCard[], lastChar: string | null) {
    const ordered = [...cards].sort((first, second) => {
        return first.dueAt - second.dueAt || first.strength - second.strength || second.mistakes - first.mistakes;
    });

    return ordered.find((card) => card.kana.char !== lastChar) ?? ordered[0] ?? null;
}

function takeDistinctRomaji(candidates: StudyCard[], count: number) {
    const seen = new Set<string>();
    const result: StudyCard[] = [];

    for (const candidate of candidates) {
        if (seen.has(candidate.kana.romaji)) continue;
        seen.add(candidate.kana.romaji);
        result.push(candidate);
        if (result.length === count) break;
    }

    return result;
}

export function createStudySession(selectedChars: KanaChar[]): StudySession {
    return {
        cards: shuffle([...selectedChars]).map((kana) => ({
            kana,
            stage: 'new',
            strength: 0,
            dueAt: 0,
            mistakes: 0,
            needsHint: false,
            confusions: {},
        })),
        questionNumber: 0,
        lastChar: null,
    };
}

export function getNextStudyCard(session: StudySession) {
    const activeCards = session.cards.filter((card) => card.stage === 'learning' || card.stage === 'review');
    const dueCards = activeCards.filter((card) => card.dueAt <= session.questionNumber);
    if (dueCards.length > 0) return prioritizeCards(dueCards, session.lastChar);

    if (activeCards.length < ACTIVE_CARD_LIMIT) {
        const newCard = session.cards.find((card) => card.stage === 'new');
        if (newCard) return newCard;
    }

    return prioritizeCards(activeCards, session.lastChar);
}

export function acknowledgeStudyCard(session: StudySession, char: string) {
    const nextQuestionNumber = session.questionNumber + 1;
    return updateCard(session, char, (card) => ({
        ...card,
        stage: 'learning',
        dueAt: nextQuestionNumber + 2,
        needsHint: false,
    }));
}

export function answerStudyCard(session: StudySession, char: string, selectedRomaji: string, isCorrect: boolean) {
    const nextQuestionNumber = session.questionNumber + 1;

    return updateCard(session, char, (card) => {
        if (!isCorrect) {
            return {
                ...card,
                stage: 'learning',
                strength: INCORRECT_STRENGTH[card.strength],
                dueAt: nextQuestionNumber + 2,
                mistakes: card.mistakes + 1,
                needsHint: true,
                confusions: {
                    ...card.confusions,
                    [selectedRomaji]: (card.confusions[selectedRomaji] ?? 0) + 1,
                },
            };
        }

        const { interval, ...progress } = CORRECT_PROGRESS[card.strength];
        return {
            ...card,
            ...progress,
            dueAt: nextQuestionNumber + interval,
            needsHint: false,
        };
    });
}

export function getStudyProgress(session: StudySession) {
    const mastered = session.cards.filter((card) => card.stage === 'mastered').length;
    const learning = session.cards.filter((card) => card.stage === 'learning' || card.stage === 'review').length;
    return { mastered, learning, total: session.cards.length };
}

export function isStudyComplete(session: StudySession) {
    return session.cards.every((card) => card.stage === 'mastered');
}

export function buildStudyOptions(session: StudySession, current: StudyCard) {
    const introducedCandidates = session.cards.filter((card) => {
        return card.stage !== 'new' && card.kana.char !== current.kana.char && card.kana.romaji !== current.kana.romaji;
    });
    const confusionOrder = Object.entries(current.confusions)
        .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
        .map(([romaji]) => romaji);
    const confused = confusionOrder.flatMap((romaji) => {
        const match = introducedCandidates.find((card) => card.kana.romaji === romaji);
        return match ? [match] : [];
    });
    const confusedRomaji = new Set(confused.map((card) => card.kana.romaji));
    const remaining = shuffle(introducedCandidates.filter((card) => !confusedRomaji.has(card.kana.romaji)));
    const wrongOptions = takeDistinctRomaji([...confused, ...remaining], 3);

    return shuffle([current.kana.romaji, ...wrongOptions.map((card) => card.kana.romaji)]);
}

export function createStudyQuestionState(card: StudyCard, options: string[]): StudyQuestionState {
    if (card.stage === 'new') {
        return {
            phase: 'first',
            prefix: 'Aprenda:',
            value: card.kana.romaji,
            tone: 'primary',
            options: ['Entendi'],
        };
    }

    if (card.needsHint) {
        return {
            phase: 'relearn',
            prefix: 'Revise:',
            value: card.kana.romaji,
            tone: 'error',
            options: [],
        };
    }

    return {
        phase: 'practice',
        prefix: 'Pr\u00E1tica',
        value: '',
        tone: 'primary',
        options,
    };
}
