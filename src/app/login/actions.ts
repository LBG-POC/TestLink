'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(password: string): Promise<{ success: boolean; message?: string }> {
  if (password === process.env.ADMIN_PASSWORD) {
    cookies().set('admin-password', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    // The redirect will be caught by the client and followed.
    // The promise will not resolve on the client-side.
    redirect('/admin');
  }
  return { success: false, message: 'Incorrect password.' };
}

export async function logoutAction() {
    cookies().delete('admin-password');
    redirect('/login');
}
