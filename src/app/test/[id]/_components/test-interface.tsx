'use client';

import { useState } from 'react';
import { type TestSession, type UserAnswer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { submitTestAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export function TestInterface({ session }: { session: TestSession }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / session.questions.length) * 100);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex((a) => a.questionId === questionId);
      if (existingAnswerIndex > -1) {
        const newAnswers = [...prev];
        newAnswers[existingAnswerIndex] = { questionId, answer };
        return newAnswers;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitTestAction(session.id, answers);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          <Label>Question {currentQuestionIndex + 1} of {session.questions.length}</Label>
          <Progress value={progress} className="mt-2" />
        </div>
        <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
        {currentQuestion.type === 'multiple-choice' && (
          <CardDescription>Select one of the following options.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {currentQuestion.type === 'multiple-choice' ? (
          <RadioGroup 
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            value={answers.find(a => a.questionId === currentQuestion.id)?.answer}
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-secondary transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            placeholder="Type your answer here..."
            className="h-48 text-base"
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            value={answers.find(a => a.questionId === currentQuestion.id)?.answer || ''}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        {currentQuestionIndex < session.questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Test
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
