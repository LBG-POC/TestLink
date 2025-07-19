import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Edit, Send } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12">
      <section className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tighter text-primary/90">
          Welcome to TestLink
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The seamless solution for creating, distributing, and managing tests. Get started by heading to the admin dashboard.
        </p>
        <div className="pt-4">
          <Button asChild size="lg">
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-6 h-6 text-primary" />
              Create Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Easily add multiple-choice or open-ended questions to your question bank.
            </p>
          </CardContent>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-6 h-6 text-primary" />
              Generate Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate unique and secure test links for each of your test takers.
            </p>
          </CardContent>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Score Automatically
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Leverage AI to score open-ended questions and get instant results.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
