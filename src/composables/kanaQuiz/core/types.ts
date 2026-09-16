import type { KanaChar } from '~/data/chars'

export type IndexedKanaChar = KanaChar & {
    index: number;
};

export type QuizSection = {
    title: string;
    chars: IndexedKanaChar[];
};

export type KanaMode = 'all' | 'hira' | 'kata';
export type QuizMode = 'normal' | 'reverse' | 'combo' | 'study';
export type SingleQuizMode = Exclude<QuizMode, 'combo'>;
export type StudyPhase = 'first' | 'practice' | 'relearn';
export type StudyStage = 'new' | 'learning' | 'review' | 'mastered';
export type StudyStrength = 0 | 1 | 2 | 3 | 4;
export type ThemeMode = 'light' | 'dark';
export type TeachingTone = 'primary' | 'success' | 'error';
export type AnswerState = 'ready' | 'correct' | 'wrong';
export type FeedbackKind = 'correct' | 'wrong';

export type SingleQuizQuestion = {
    mode: SingleQuizMode;
    char: KanaChar;
};

export type ComboQuizQuestion = {
    mode: 'combo';
    chars: [KanaChar, KanaChar, KanaChar];
};

export type QuizQuestion = SingleQuizQuestion | ComboQuizQuestion;

export type StudyCard = {
    kana: KanaChar;
    stage: StudyStage;
    strength: StudyStrength;
    dueAt: number;
    mistakes: number;
    needsHint: boolean;
    confusions: Record<string, number>;
};

export type StudySession = {
    cards: StudyCard[];
    questionNumber: number;
    lastChar: string | null;
};

export type KanaStats = {
    hits: number;
    miss: number;
};

export type PersistedStats = {
    perKana: Record<string, KanaStats>;
};

export type ModalButton = {
    label: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
};

export type ModalContent =
    | { kind: 'text'; text: string }
    | {
        kind: 'summary'
        elapsed: string
        hits: number
        misses: number
        mastery: { mastered: number; total: number } | null
        reviewItems: Array<{ char: string; romaji: string; misses: number }>
        confusions: Array<{ char: string; expected: string; selected: string; count: number }>
    };

export type ModalState = {
    title: string;
    content: ModalContent;
    buttons: ModalButton[];
    dismissible: boolean;
};
