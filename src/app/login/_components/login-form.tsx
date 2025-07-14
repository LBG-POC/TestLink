'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '../actions';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginAction(password);

      if (!result.success) {
        toast({
          title: 'Login failed',
          description: result.message || 'Incorrect password.',
          variant: 'destructive',
        });
      }
      // On success, the server action will redirect, and this part of the code
      // will not be reached because the component unmounts.
    } catch (error) {
       // A redirect error from Next.js might be caught here on the client.
       // We can safely ignore it as the browser will follow the redirect.
       // For other errors, we should show a message.
       if (error && typeof error === 'object' && 'digest' in error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
         // This is a redirect error, we can ignore it.
         toast({ title: 'Login successful! Redirecting...' });
         // The router refresh ensures the client is in sync with the server's state
         router.refresh();
       } else {
         toast({
          title: 'An error occurred',
          description: 'Please try again later.',
          variant: 'destructive',
        });
       }
    } finally {
      // In case of failure or non-redirect error, stop loading.
      // On success, the component will unmount, so this won't be called.
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
        <CardDescription>Enter the password to access the admin dashboard.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
