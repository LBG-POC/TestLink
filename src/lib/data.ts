'use server';

import type { Question, QuestionBank, TestTaker, TestSession, UserAnswer } from './types';

// In-memory store that persists across hot-reloads in development
type Db = {
  questions: Question[];
  testTakers: TestTaker[];
  testSessions: TestSession[];
  questionBanks: QuestionBank[];
};

const dbSingleton = (): Db => {
  return {
    questionBanks: [
      { id: 'qb1', name: 'General Knowledge' },
    ],
    questions: [
      {
        id: 'q1',
        questionBankId: 'qb1',
        text: 'What is the capital of France?',
        type: 'multiple-choice',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        answer: 'Paris',
        timeLimit: 30,
      },
      {
        id: 'q2',
        questionBankId: 'qb1',
        text: 'Explain the theory of relativity in your own words.',
        type: 'open-ended',
        timeLimit: 180,
      },
      {
        id: 'q3',
        questionBankId: 'qb1',
        text: 'What is 2 + 2?',
        type: 'multiple-choice',
        options: ['3', '4', '5', '6'],
        answer: '4',
        timeLimit: 15,
      }
    ],
    testTakers: [
      { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', testSessionId: null, testStatus: 'Not Started' }
    ],
    testSessions: [],
  };
};

declare global {
  var db: undefined | Db;
}

const db = globalThis.db ?? dbSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.db = db;
}


// --- Question Bank Management ---
export async function getQuestionBanks(): Promise<QuestionBank[]> {
  return db.questionBanks;
}

export async function addQuestionBank(bank: Omit<QuestionBank, 'id'>): Promise<QuestionBank> {
  const newBank: QuestionBank = { ...bank, id: crypto.randomUUID() };
  db.questionBanks.push(newBank);
  return newBank;
}

export async function removeQuestionBank(id: string): Promise<void> {
  db.questionBanks = db.questionBanks.filter(qb => qb.id !== id);
  // Also remove questions associated with this bank
  db.questions = db.questions.filter(q => q.questionBankId !== id);
}


// --- Question Management ---
export async function getQuestions(): Promise<Question[]> {
  return db.questions;
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
  const newQuestion: Question = { ...question, id: crypto.randomUUID() };
  db.questions.push(newQuestion);
  return newQuestion;
}

export async function removeQuestion(id: string): Promise<void> {
  db.questions = db.questions.filter(q => q.id !== id);
}

// --- Test Taker Management ---
export async function getTestTakers(): Promise<TestTaker[]> {
  // Enhance test takers with their score from the session
  return db.testTakers.map(taker => {
    const session = db.testSessions.find(s => s.id === taker.testSessionId);
    return {
      ...taker,
      score: session ? session.score : null
    };
  });
}


export async function addTestTaker(taker: Omit<TestTaker, 'id' | 'testSessionId' | 'testStatus'>): Promise<TestTaker> {
  const newTaker: TestTaker = { ...taker, id: crypto.randomUUID(), testSessionId: null, testStatus: 'Not Started' };
  db.testTakers.push(newTaker);
  return newTaker;
}

// --- Test Session Management ---
export async function createTestSession(testTakerId: string, questionBankId: string): Promise<TestSession> {
    const testTaker = db.testTakers.find(t => t.id === testTakerId);
    if (!testTaker) throw new Error('Test taker not found');
    
    const questionsFromBank = db.questions.filter(q => q.questionBankId === questionBankId);
    if (questionsFromBank.length === 0) throw new Error('Selected question bank has no questions.');

    const newSession: TestSession = {
        id: crypto.randomUUID(),
        testTakerId,
        status: 'Not Started',
        questions: [...questionsFromBank], // Snapshot of questions from the selected bank
        answers: [],
        score: null,
        aiFeedback: {},
        startedAt: Date.now(),
        completedAt: null
    };
    db.testSessions.push(newSession);

    // Update the test taker record
    testTaker.testSessionId = newSession.id;
    testTaker.testStatus = 'Not Started';

    return newSession;
}

export async function getTestSession(sessionId: string): Promise<TestSession | undefined> {
    const session = db.testSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    
    // Make sure session has questions. If questions were deleted after session was created, it might be empty.
    if (session.questions.length === 0) {
      const bankIdForSession = db.questions.find(q => session.answers.some(a => a.questionId === q.id))?.questionBankId;
      if (bankIdForSession) {
        session.questions = db.questions.filter(q => q.questionBankId === bankIdForSession);
      }
    }
    
    return session;
}

export async function completeTestSession(sessionId: string, answers: UserAnswer[], score: number, aiFeedback: Record<string,string>): Promise<TestSession> {
    const session = db.testSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.answers = answers;
    session.score = score;
    session.aiFeedback = aiFeedback;
    session.status = 'Completed';
    session.completedAt = Date.now();

    const testTaker = db.testTakers.find(t => t.id === session.testTakerId);
    if (testTaker) {
        testTaker.testStatus = 'Completed';
    }

    return session;
}
