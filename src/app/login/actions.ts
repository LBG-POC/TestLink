'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(password: string): Promise<{ success: boolean }> {
  if (password === process.env.ADMIN_PASSWORD) {
    cookies().set('admin-password', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false };
}

export async function logoutAction() {
    cookies().delete('admin-password');
    redirect('/login');
}
