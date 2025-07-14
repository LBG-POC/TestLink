'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  addQuestion as dbAddQuestion, 
  removeQuestion as dbRemoveQuestion, 
  getQuestions, 
  createTestSession as dbCreateTestSession, 
  completeTestSession as dbCompleteTestSession, 
  addTestTaker as dbAddTestTaker,
  addQuestionBank as dbAddQuestionBank,
  removeQuestionBank as dbRemoveQuestionBank,
  getTestSession
} from '@/lib/data';
import type { Question, UserAnswer } from '@/lib/types';
import { aiScoreEssay } from '@/ai/flows/ai-score-essay';

export async function addQuestionAction(formData: FormData) {
  const text = formData.get('text') as string;
  const type = formData.get('type') as 'multiple-choice' | 'open-ended';
  const timeLimit = formData.get('timeLimit') ? Number(formData.get('timeLimit')) : undefined;
  const questionBankId = formData.get('questionBankId') as string;
  
  const questionData: Omit<Question, 'id'> = { text, type, timeLimit, questionBankId };

  if (type === 'multiple-choice') {
    questionData.options = [
      formData.get('option1') as string,
      formData.get('option2') as string,
      formData.get('option3') as string,
      formData.get('option4') as string,
    ].filter(Boolean);
    questionData.answer = formData.get('answer') as string;
  }
  
  await dbAddQuestion(questionData);
  revalidatePath('/admin');
}

export async function removeQuestionAction(id: string) {
  await dbRemoveQuestion(id);
  revalidatePath('/admin');
}

export async function addQuestionBankAction(formData: FormData) {
  const name = formData.get('name') as string;
  await dbAddQuestionBank({ name });
  revalidatePath('/admin');
}

export async function removeQuestionBankAction(id: string) {
  await dbRemoveQuestionBank(id);
  revalidatePath('/admin');
}

export async function createTestSessionAction(testTakerId: string, questionBankId: string) {
  try {
    const session = await dbCreateTestSession(testTakerId, questionBankId);
    revalidatePath('/admin');
    return session;
  } catch (error: any) {
    // We are returning the error message to the client so it can be displayed in a toast.
    return { error: error.message };
  }
}


export async function submitTestAction(sessionId: string, answers: UserAnswer[]) {
  const session = await getTestSession(sessionId);
  if (!session) throw new Error('Session not found during submission.');

  let correctAnswers = 0;
  const aiFeedback: Record<string, string> = {};

  for (const userAnswer of answers) {
    const question = session.questions.find(q => q.id === userAnswer.questionId);
    if (!question) continue;

    if (question.type === 'multiple-choice') {
      if (question.answer === userAnswer.answer) {
        correctAnswers++;
      }
    } else if (question.type === 'open-ended') {
      try {
        const result = await aiScoreEssay({ subject: question.text, essay: userAnswer.answer });
        // AI score is out of 100, let's say it counts as one question.
        // A score of 70+ is considered "correct" for calculation purposes.
        if(result.score >= 70) {
            correctAnswers++;
        }
        aiFeedback[question.id] = result.feedback;
      } catch (error) {
        console.error("AI scoring failed for question:", question.id, error);
        aiFeedback[question.id] = "AI scoring was unavailable for this question.";
      }
    }
  }

  const totalQuestions = session.questions.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  await dbCompleteTestSession(sessionId, answers, score, aiFeedback);
  
  redirect(`/results/${sessionId}`);
}

export async function addTestTakerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  await dbAddTestTaker({ name, email });
  revalidatePath('/admin');
}
