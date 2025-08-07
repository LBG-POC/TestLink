export type QuestionBank = {
  id: string;
  name: string;
}

export type Question = {
  id: string;
  questionBankId: string;
  text: string;
  type: 'multiple-choice' | 'open-ended';
  options?: string[];
  answer?: string; // For multiple-choice, this is the text of the correct option
  timeLimit?: number; // Time limit in seconds
};

export type TestTaker = {
  id: string;
  name: string;
  mobile: string;
  testSessionId: string | null;
  testStatus: 'Not Started' | 'Completed';
  score?: number | null;
};

export type UserAnswer = {
  questionId: string;
  answer: string;
};

export type TestSession = {
  id: string;
  testTakerId: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  questions: Question[];
  answers: UserAnswer[];
  score: number | null;
  aiFeedback: Record<string, string>; // questionId -> feedback
  startedAt: number | null;
  completedAt: number | null;
};
