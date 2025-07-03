import { getTestSession } from '@/lib/data';
import { TestInterface } from './_components/test-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TestPage({ params }: { params: { id: string } }) {
  const session = await getTestSession(params.id);

  if (!session) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Invalid Test Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The test link you are using is invalid or has expired. Please contact the administrator.</p>
           <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
        </CardContent>
      </Card>
    );
  }

  if (session.status === 'Completed') {
    return (
       <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-primary"/> Test Already Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This test has already been completed. You can view your results below.</p>
          <Button asChild className="mt-4"><Link href={`/results/${session.id}`}>View Results</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return <TestInterface session={session} />;
}
