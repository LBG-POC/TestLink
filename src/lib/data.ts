'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import type { Question, QuestionBank, TestTaker, TestSession, UserAnswer } from './types';

const questionBanksCollection = collection(db, 'questionBanks');
const questionsCollection = collection(db, 'questions');
const testTakersCollection = collection(db, 'testTakers');
const testSessionsCollection = collection(db, 'testSessions');


// --- Question Bank Management ---
export async function getQuestionBanks(): Promise<QuestionBank[]> {
  console.log('getQuestionBanks called');
  const snapshot = await getDocs(questionBanksCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuestionBank[];
}

export async function addQuestionBank(bank: Omit<QuestionBank, 'id'>): Promise<QuestionBank> {
  const docRef = await addDoc(questionBanksCollection, bank);
  return { id: docRef.id, ...bank };
}

export async function removeQuestionBank(id: string): Promise<void> {
  await deleteDoc(doc(questionBanksCollection, id));
  // Also remove questions associated with this bank
  const questionsQuery = query(questionsCollection, where('questionBankId', '==', id));
  const questionsSnapshot = await getDocs(questionsQuery);
  const deleteQuestionPromises = questionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deleteQuestionPromises);
}


// --- Question Management ---
export async function getQuestions(): Promise<Question[]> {
  console.log('getQuestions called');
  const snapshot = await getDocs(questionsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
  const docRef = await addDoc(questionsCollection, question);
  return { id: docRef.id, ...question };
}

export async function removeQuestion(id: string): Promise<void> {
  await deleteDoc(doc(questionsCollection, id));
}

export async function updateQuestion(id: string, updatedQuestionData: Omit<Question, 'id'>): Promise<void> {
  const questionDocRef = doc(questionsCollection, id);
  try {
    await updateDoc(questionDocRef, updatedQuestionData);
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

// --- Test Taker Management ---
export async function getTestTakers(): Promise<TestTaker[]> {
  console.log('getTestTakers called');
  const takersSnapshot = await getDocs(testTakersCollection);
  const testTakers: TestTaker[] = [];
  for (const takerDoc of takersSnapshot.docs) {
    const takerData = takerDoc.data() as TestTaker;
    let score: number | null = null;
    if (takerData.testSessionId) {
      const sessionDoc = await getDoc(doc(testSessionsCollection, takerData.testSessionId));
      if (sessionDoc.exists()) {
        score = (sessionDoc.data() as TestSession).score;
      }
    }
    const testTakerWithScore: TestTaker & { score: number | null } = {
      id: takerDoc.id,
      name: takerData.name,
      mobile: takerData.mobile,
      testSessionId: takerData.testSessionId,
      testStatus: takerData.testStatus,
      score,
    };
    testTakers.push(testTakerWithScore);
  }
  return testTakers;
}


export async function addTestTaker(taker: Omit<TestTaker, 'id' | 'testSessionId' | 'testStatus'>): Promise<TestTaker> {
  console.log('addTestTaker called with:', taker);
  const newTakerData = { ...taker, testSessionId: null, testStatus: 'Not Started' };
  const docRef = await addDoc(testTakersCollection, newTakerData);
  return { id: docRef.id, ...newTakerData };
}

// --- Test Session Management ---
export async function createTestSession(testTakerId: string, questionBankId: string): Promise<TestSession> {
    console.log('createTestSession called with:', { testTakerId, questionBankId });

    const testTakerDoc = await getDoc(doc(testTakersCollection, testTakerId));
    const testTaker = testTakerDoc.data() as TestTaker | undefined;
    if (!testTaker) throw new Error('Test taker not found');

    const questionsQuery = query(questionsCollection, where('questionBankId', '==', questionBankId));
    const questionsSnapshot = await getDocs(questionsQuery);
    const questionsFromBank = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
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
    const sessionDocRef = await addDoc(testSessionsCollection, newSession);
    const sessionId = sessionDocRef.id;

    // Update the test taker record
    await updateDoc(testTakerDoc.ref, {
      testSessionId: sessionId,
      testStatus: 'Not Started'
    });

    console.log('Test session created:', { sessionId, newSession });

    return { id: sessionId, ...newSession };
}

export async function getTestSession(sessionId: string): Promise<TestSession | undefined> {
    const sessionDoc = await getDoc(doc(testSessionsCollection, sessionId));
    if (!sessionDoc.exists()) return undefined;
    return { id: sessionDoc.id, ...sessionDoc.data() } as TestSession;
}

export async function completeTestSession(sessionId: string, answers: UserAnswer[], score: number, aiFeedback: Record<string,string>): Promise<TestSession> {
    const sessionDocRef = doc(testSessionsCollection, sessionId);
    await updateDoc(sessionDocRef, {
        answers, score, aiFeedback, status: 'Completed', completedAt: Date.now()
    });
    const sessionDoc = await getDoc(sessionDocRef);
    return { id: sessionDoc.id, ...sessionDoc.data() } as TestSession;
}
