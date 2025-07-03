import { getTestSession } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PASSING_SCORE = 70;

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const session = await getTestSession(params.id);

  if (!session || session.status !== 'Completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Result Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The results for this test session could not be found or the test has not been completed yet.</p>
           <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const isPassing = session.score! >= PASSING_SCORE;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
            {isPassing ? <CheckCircle className="w-12 h-12 text-accent" /> : <AlertTriangle className="w-12 h-12 text-destructive" />}
          </div>
          <CardTitle className="text-4xl font-bold">
            Test Completed
          </CardTitle>
          <CardDescription className="text-lg">
            You scored {session.score}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className={`text-lg px-6 py-2 ${isPassing ? 'bg-accent hover:bg-accent/90' : 'bg-destructive hover:bg-destructive/90'}`}>
            {isPassing ? 'Passing' : 'Failing'}
          </Badge>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant="outline">
            <Link href="/admin">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Review your answers and AI feedback for open-ended questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {session.questions.map(q => {
              const userAnswer = session.answers.find(a => a.questionId === q.id);
              const aiFeedback = session.aiFeedback[q.id];

              if (q.type !== 'open-ended' || !userAnswer || !aiFeedback) return null;

              return (
                <AccordionItem value={q.id} key={q.id}>
                  <AccordionTrigger>{q.text}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Your Answer</h4>
                      <p className="text-muted-foreground p-3 bg-secondary rounded-md mt-1">{userAnswer.answer}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-primary" />AI Feedback</h4>
                      <p className="text-muted-foreground p-3 bg-secondary rounded-md mt-1">{aiFeedback}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
