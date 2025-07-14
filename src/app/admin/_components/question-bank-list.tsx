'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { QuestionBank } from '@/lib/types';
import { addQuestionBankAction, removeQuestionBankAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function QuestionBankList({ initialQuestionBanks = [] }: { initialQuestionBanks: QuestionBank[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddQuestionBank = async (formData: FormData) => {
    await addQuestionBankAction(formData);
    setOpen(false);
    toast({
      title: 'Success!',
      description: 'New question bank has been created.',
      className: 'bg-accent text-accent-foreground',
    });
  };

  const handleRemoveQuestionBank = async (id: string) => {
    await removeQuestionBankAction(id);
    toast({
      title: 'Success!',
      description: 'Question bank has been removed.',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Question Banks</CardTitle>
          <CardDescription>Create and manage collections of questions.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Bank</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={handleAddQuestionBank}>
              <DialogHeader>
                <DialogTitle>Add a New Question Bank</DialogTitle>
                <DialogDescription>Give your new question bank a name.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Bank Name</Label>
                  <Input id="name" name="name" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Create Bank</Button>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialQuestionBanks.length > 0 ? initialQuestionBanks.map((qb) => (
              <TableRow key={qb.id}>
                <TableCell className="font-medium">{qb.name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestionBank(qb.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={2} className="text-center">No question banks found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
