'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '../actions';
import { Loader2 } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Login
    </Button>
  );
}

const initialState = {
  success: false,
  message: '',
};

export function LoginForm() {
  const { toast } = useToast();

  const clientLoginAction = async (_prevState: any, formData: FormData) => {
    const password = formData.get('password') as string;
    const result = await loginAction(password);
    
    if (!result.success) {
      toast({
        title: 'Login failed',
        description: result.message || 'Incorrect password.',
        variant: 'destructive',
      });
    }
    // On success, the redirect in loginAction will be handled automatically by Next.js
    return result;
  };
  
  const [state, formAction] = useFormState(clientLoginAction, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
        <CardDescription>Enter the password to access the admin dashboard.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}