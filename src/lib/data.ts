'use server';

import type { Question, TestTaker, TestSession, UserAnswer } from './types';

// In-memory store
let questions: Question[] = [
  {
    id: 'q1',
    text: 'What is the capital of France?',
    type: 'multiple-choice',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    answer: 'Paris',
  },
  {
    id: 'q2',
    text: 'Explain the theory of relativity in your own words.',
    type: 'open-ended',
  },
  {
    id: 'q3',
    text: 'What is 2 + 2?',
    type: 'multiple-choice',
    options: ['3', '4', '5', '6'],
    answer: '4',
  }
];

let testTakers: TestTaker[] = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', testSessionId: null, testStatus: 'Not Started' }
];

let testSessions: TestSession[] = [];

// --- Question Management ---
export async function getQuestions(): Promise<Question[]> {
  return questions;
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
  const newQuestion: Question = { ...question, id: crypto.randomUUID() };
  questions.push(newQuestion);
  return newQuestion;
}

export async function removeQuestion(id: string): Promise<void> {
  questions = questions.filter(q => q.id !== id);
}

// --- Test Taker Management ---
export async function getTestTakers(): Promise<TestTaker[]> {
  // Enhance test takers with their score from the session
  return testTakers.map(taker => {
    const session = testSessions.find(s => s.id === taker.testSessionId);
    return {
      ...taker,
      score: session ? session.score : null
    };
  });
}


export async function addTestTaker(taker: Omit<TestTaker, 'id' | 'testSessionId' | 'testStatus'>): Promise<TestTaker> {
  const newTaker: TestTaker = { ...taker, id: crypto.randomUUID(), testSessionId: null, testStatus: 'Not Started' };
  testTakers.push(newTaker);
  return newTaker;
}

// --- Test Session Management ---
export async function createTestSession(testTakerId: string): Promise<TestSession> {
    const testTaker = testTakers.find(t => t.id === testTakerId);
    if (!testTaker) throw new Error('Test taker not found');

    const newSession: TestSession = {
        id: crypto.randomUUID(),
        testTakerId,
        status: 'Not Started',
        questions: [...questions], // Snapshot of current questions
        answers: [],
        score: null,
        aiFeedback: {},
        startedAt: Date.now(),
        completedAt: null
    };
    testSessions.push(newSession);

    // Update the test taker record
    testTaker.testSessionId = newSession.id;
    testTaker.testStatus = 'Not Started';

    return newSession;
}

export async function getTestSession(sessionId: string): Promise<TestSession | undefined> {
    return testSessions.find(s => s.id === sessionId);
}

export async function completeTestSession(sessionId: string, answers: UserAnswer[], score: number, aiFeedback: Record<string,string>): Promise<TestSession> {
    const session = testSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.answers = answers;
    session.score = score;
    session.aiFeedback = aiFeedback;
    session.status = 'Completed';
    session.completedAt = Date.now();

    const testTaker = testTakers.find(t => t.id === session.testTakerId);
    if (testTaker) {
        testTaker.testStatus = 'Completed';
    }

    return session;
}
