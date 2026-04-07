import type { KanaChar } from '~/data/chars'

export type StudyCharStat = {
    correct: number;
    incorrect: number;
    firstTime: boolean;
    teach: boolean;
};

export type IndexedKanaChar = KanaChar & {
    index: number;
};

export type QuizSection = {
    title: string;
    chars: IndexedKanaChar[];
};

export type KanaMode = 'all' | 'hira' | 'kata';
export type QuizMode = 'normal' | 'reverse' | 'combo' | 'study';
export type StudyPhase = 'first' | 'practice' | 'relearn';
export type ThemeMode = 'light' | 'dark';
export type QuizEntry = KanaChar | KanaChar[];
export type TeachingTone = 'primary' | 'success';

export type KanaStats = {
    hits: number;
    miss: number;
};

export type PersistedStats = {
    hits: number;
    miss: number;
    perKana: Record<string, KanaStats>;
};

export type ModalButton = {
    text: string;
    type?: 'primary' | 'secondary';
    onClick?: () => void;
};

export type Profile = {
    version: number;
    level: number;
    xp: number;
    totalXp: number;
    rank: string;
    updatedAt: number;
};
