import { getQuestions, getTestTakers } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionList } from './_components/question-list';
import { TestTakerList } from './_components/test-taker-list';

export default async function AdminPage() {
  const questions = await getQuestions();
  const testTakers = await getTestTakers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your questions and test takers here.</p>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Manage Questions</TabsTrigger>
          <TabsTrigger value="takers">Manage Test Takers</TabsTrigger>
        </TabsList>
        <TabsContent value="questions">
          <QuestionList initialQuestions={questions} />
        </TabsContent>
        <TabsContent value="takers">
          <TestTakerList initialTestTakers={testTakers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
