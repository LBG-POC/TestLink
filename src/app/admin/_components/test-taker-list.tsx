'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCopy, PlusCircle, Send } from 'lucide-react';
import type { TestTaker } from '@/lib/types';
import { createTestSessionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { addTestTaker } from '@/lib/data';
import { revalidatePath } from 'next/cache';

async function addTestTakerAction(formData: FormData) {
  'use server'
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  await addTestTaker({ name, email });
  revalidatePath('/admin');
}

export function TestTakerList({ initialTestTakers }: { initialTestTakers: TestTaker[] }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const { toast } = useToast();

  const handleAddTaker = async (formData: FormData) => {
    await addTestTakerAction(formData);
    setAddDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'New test taker has been added.',
      className: 'bg-accent text-accent-foreground',
    });
  };

  const handleGenerateLink = async (takerId: string) => {
    const session = await createTestSessionAction(takerId);
    const link = `${window.location.origin}/test/${session.id}`;
    setGeneratedLink(link);
    setLinkDialogOpen(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: 'Copied to clipboard!' });
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
              <form action={handleAddTaker}>
                <DialogHeader>
                  <DialogTitle>Add Test Taker</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
                  <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required/></div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Taker</Button>
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
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTestTakers.map((taker) => (
                <TableRow key={taker.id}>
                  <TableCell className="font-medium">{taker.name}</TableCell>
                  <TableCell>{taker.email}</TableCell>
                  <TableCell>
                    <Badge variant={taker.testStatus === 'Completed' ? 'default' : 'secondary'} className={taker.testStatus === 'Completed' ? 'bg-accent' : ''}>{taker.testStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleGenerateLink(taker.id)} disabled={taker.testStatus === 'Completed'}>
                      <Send className="mr-2 h-4 w-4" /> Generate Link
                    </Button>
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
            <Button onClick={() => setLinkDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
