import { getQuestions, getTestTakers, getQuestionBanks } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionList } from './_components/question-list';
import { TestTakerList } from './_components/test-taker-list';
import { QuestionBankList } from './_components/question-bank-list';

export default async function AdminPage() {
  const questions = await getQuestions();
  const testTakers = await getTestTakers();
  const questionBanks = await getQuestionBanks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your questions and test takers here.</p>
      </div>

      <Tabs defaultValue="takers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="takers">Manage Test Takers</TabsTrigger>
          <TabsTrigger value="questions">Manage Questions</TabsTrigger>
          <TabsTrigger value="banks">Manage Question Banks</TabsTrigger>
        </TabsList>
        <TabsContent value="takers">
          <TestTakerList initialTestTakers={testTakers} questionBanks={questionBanks} />
        </TabsContent>
        <TabsContent value="questions">
          <QuestionList initialQuestions={questions} questionBanks={questionBanks} />
        </TabsContent>
        <TabsContent value="banks">
          <QuestionBankList initialQuestionBanks={questionBanks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
