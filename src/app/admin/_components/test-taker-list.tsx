'use client';

import { useReducer, useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCopy, PlusCircle, Send, Loader2, FileText } from 'lucide-react';
import type { TestTaker, QuestionBank } from '@/lib/types';
import { createTestSessionAction, addTestTakerAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function AddTakerSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add Taker
    </Button>
  );
}

export function TestTakerList({ initialTestTakers = [], questionBanks = [] }: { initialTestTakers: TestTaker[], questionBanks: QuestionBank[] }) {
  const [selectedTakerId, setSelectedTakerId] = useReducer((_state: any, payload: string | null) => payload, null);
  const [addDialogOpen, setAddDialogOpen] = useReducer((_state: any, payload: boolean) => payload, false);
  const [generateLinkDialogOpen, setGenerateLinkDialogOpen] = useReducer((_state: any, payload: boolean) => payload, false);
  const [linkDialogOpen, setLinkDialogOpen] = useReducer((_state: any, payload: boolean) => payload, false);
  const [generatedLink, setGeneratedLink] = useReducer((_state: any, payload: string) => payload, '');

  const { toast } = useToast();

  const handleAddTakerAction = async (prevState: any, formData: FormData) => {
    await addTestTakerAction(formData);
    setAddDialogOpen(false);
    toast({
        title: 'Success!',
        description: 'New test taker has been added.',
        className: 'bg-accent text-accent-foreground',
    });
    return { message: 'success' };
  };

  const [addTakerState, addTakerFormAction] = useActionState(handleAddTakerAction, { message: '' });

  const handleOpenGenerateLinkDialog = (takerId: string) => {
    if (!questionBanks || questionBanks.length === 0) {
      toast({
        title: 'Cannot Generate Link',
        description: 'You must create at least one question bank before generating a test link.',
        variant: 'destructive'
      })
      return;
    }
    setSelectedTakerId(takerId);
    setGenerateLinkDialogOpen(true);
  }

  const handleGenerateLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTakerId) return;

    const formData = new FormData(e.currentTarget);
    const questionBankId = formData.get('questionBankId') as string;

    const result = await createTestSessionAction(selectedTakerId, questionBankId);
      
    if (result && 'id' in result) {
      const link = `${window.location.origin}/test/${result.id}`;
      setGeneratedLink(link);
      setGenerateLinkDialogOpen(false);
      setLinkDialogOpen(true);
    } else {
      toast({
          title: 'Error Generating Link',
          description: (result && 'error' in result && result.error) || 'Could not create a test session.',
          variant: 'destructive'
      });
      setGenerateLinkDialogOpen(false);
    }
  };
  
  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedLink);
      toast({ title: 'Copied to clipboard!' });
    } else {
      console.error('Clipboard API not available.');
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Test Takers</CardTitle>
            <CardDescription>Manage users and send them test links.</CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Taker</Button>
            </DialogTrigger>
            <DialogContent>
              <form action={addTakerFormAction}>
                <DialogHeader>
                  <DialogTitle>Add Test Taker</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4"></div>
                <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
                <div className="grid gap-2"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" name="mobile" type="text" pattern="^\d{10}$" title="Please enter exactly 10 digits" required /></div>
 {/* <div className="grid gap-2"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" name="mobile" type="text" pattern="^\d{10}$" title="Please enter exactly 10 digits" required /></div> */}
                <DialogFooter>
                   <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                  <AddTakerSubmitButton />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
              {(initialTestTakers || []).map((taker) => (
                <TableRow key={taker.id}>
                  <TableCell className="font-medium">{taker.name}</TableCell>
 <TableCell>{taker.mobile}</TableCell>
                  <TableCell>
                    <Badge variant={taker.testStatus === 'Completed' ? 'default' : 'secondary'} className={taker.testStatus === 'Completed' ? 'bg-accent' : ''}>{taker.testStatus}</Badge>
                  </TableCell>
                  <TableCell>{taker.score !== null && taker.score !== undefined ? `${taker.score}%` : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {taker.testStatus === 'Completed' && taker.testSessionId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/results/${taker.testSessionId}`}>
                          <FileText className="mr-2 h-4 w-4" /> View Results
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleOpenGenerateLinkDialog(taker.id)} disabled={taker.testStatus === 'Completed'}>
                        <Send className="mr-2 h-4 w-4" /> Generate Link
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Link Generated</DialogTitle>
            <DialogDescription>Share this link with the test taker. It is valid for one attempt.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input value={generatedLink} readOnly />
            <Button type="button" size="icon" onClick={copyToClipboard}>
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="mt-4">
             <DialogClose asChild><Button type="button">Done</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={generateLinkDialogOpen} onOpenChange={setGenerateLinkDialogOpen}>
        <DialogContent>
           <form onSubmit={handleGenerateLinkSubmit}>
            <DialogHeader>
                <DialogTitle>Generate Test Link</DialogTitle>
                <DialogDescription>Select a question bank to generate a test link for this user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                   <Label htmlFor="questionBankId">Question Bank</Label>
                   <Select name="questionBankId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {(questionBanks || []).map(bank => (
                            <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
              </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Generate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
