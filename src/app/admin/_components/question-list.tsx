'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionState } from "react";
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import type { Question, QuestionBank } from '@/lib/types';
import { addQuestionAction, removeQuestionAction, editQuestionAction, testAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function QuestionList({ initialQuestions = [], questionBanks = [] }: { initialQuestions: Question[], questionBanks: QuestionBank[] }) {
  const [open, setOpen] = useState(false);
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'open-ended'>('multiple-choice');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const editingQuestion = initialQuestions.find(q => q.id === editingQuestionId);
  const { toast } = useToast();

  const handleAddQuestion = async (formData: FormData) => {
    await addQuestionAction(formData);
    setOpen(false);
    toast({
      title: 'Success!',
      description: 'New question has been added.',
      className: 'bg-accent text-accent-foreground',
    });
  };

  const handleRemoveQuestion = async (id: string) => {
    await removeQuestionAction(id);
    toast({
      title: 'Success!',
      description: 'Question has been removed.',
    });
  };

  const handleEditQuestionClick = (questionId: string) => {
    setEditingQuestionId(questionId);
    setEditDialogOpen(true);
  };
  
  const [state, formAction] = useActionState(
    editQuestionAction,
    null
  );

  // Effect to close dialog and show toast on successful submission
  // useEffect(() => { // Consider using useEffect if state changes should trigger side effects
  if (state && state.success) {
    setEditDialogOpen(false);
    toast({ title: "Success!", description: state.message }); // Assuming the action returns { success: boolean, message: string }
  }
  // }, [state, setEditDialogOpen, toast]);

  const getBankName = (bankId: string) => {
    return questionBanks.find(b => b.id === bankId)?.name || 'Uncategorized';
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>View, add, or remove questions from your tests.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Question</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form action={handleAddQuestion}>
              <DialogHeader>
                <DialogTitle>Add a New Question</DialogTitle>
                <DialogDescription>Fill in the details for the new question.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                   <Label htmlFor="questionBankId">Question Bank</Label>
                   <Select name="questionBankId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionBanks.map(bank => (
                            <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Input id="text" name="text" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Question Type</Label>
                    <Select name="type" required value={questionType} onValueChange={(v) => setQuestionType(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="open-ended">Open-ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                    <Input id="timeLimit" name="timeLimit" type="number" placeholder="e.g., 60" />
                  </div>
                </div>

                {questionType === 'multiple-choice' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label htmlFor="option1">Option 1</Label><Input id="option1" name="option1" required/></div>
                      <div className="grid gap-2"><Label htmlFor="option2">Option 2</Label><Input id="option2" name="option2" required/></div>
                      <div className="grid gap-2"><Label htmlFor="option3">Option 3</Label><Input id="option3" name="option3" /></div>
                      <div className="grid gap-2"><Label htmlFor="option4">Option 4</Label><Input id="option4" name="option4" /></div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="answer">Correct Answer</Label>
                      <Input id="answer" name="answer" placeholder="Type the exact text of the correct option" required/>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save Question</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialQuestions.length > 0 ? (
              initialQuestions
                .filter(q => q.id) // Ensure filtering happens here
                .map((q) => (
                  <TableRow key={q.id}> {/* This is the element directly returned by map */}
                    <TableCell className="font-medium max-w-lg truncate">{q.text}</TableCell>
                    <TableCell><Badge variant="secondary">{q.type}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{getBankName(q.questionBankId)}</Badge></TableCell>
                    <TableCell>{q.timeLimit ? `${q.timeLimit}s` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {/* Edit Button */}
                      <Button variant="ghost" size="icon" onClick={() => handleEditQuestionClick(q.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* Remove Button */}
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No questions found.</TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </CardContent>
    </Card>

    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
 <form action={formAction}> {/* Use the action from useActionState */}
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Modify the details for the question.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
               <Label htmlFor="edit-questionBankId">Question Bank</Label>
               <Select name="questionBankId" required defaultValue={editingQuestion?.questionBankId}>
                  <SelectTrigger id="edit-questionBankId">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionBanks.map(bank => (
                        <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-text">Question Text</Label>
              <Input id="edit-text" name="text" required defaultValue={editingQuestion?.text} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Question Type</Label>
                {/* Note: Changing question type on edit might require more complex handling */}
                <Input id="edit-type" name="type" value={editingQuestion?.type} readOnly disabled />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="edit-timeLimit">Time Limit (seconds)</Label>
                <Input id="edit-timeLimit" name="timeLimit" type="number" placeholder="e.g., 60" defaultValue={editingQuestion?.timeLimit} />
              </div>
            </div>

            {editingQuestion?.type === 'multiple-choice' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="edit-option1">Option 1</Label><Input id="edit-option1" name="option1" required defaultValue={editingQuestion?.options?.[0]}/></div>
                  <div className="grid gap-2"><Label htmlFor="edit-option2">Option 2</Label><Input id="edit-option2" name="option2" required defaultValue={editingQuestion?.options?.[1]}/></div>
                  <div className="grid gap-2"><Label htmlFor="edit-option3">Option 3</Label><Input id="edit-option3" name="option3" defaultValue={editingQuestion?.options?.[2]} /></div>
                  <div className="grid gap-2"><Label htmlFor="edit-option4">Option 4</Label><Input id="edit-option4" name="option4" defaultValue={editingQuestion?.options?.[3]} /></div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-answer">Correct Answer</Label>
                  <Input id="edit-answer" name="answer" placeholder="Type the exact text of the correct option" required defaultValue={editingQuestion?.answer}/>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
