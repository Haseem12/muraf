'use server';

import { z } from 'zod';
import { api } from '@/lib/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const allowedUsers = [
  { username: 'director', password: '123456', role: 'director' },
  { username: 'manager', password: '123456', role: 'manager' },
  { username: 'alh murtala', password: '123456', role: 'staff' },
];

export async function handleLogin(prevState: any, formData: FormData) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ...prevState, error: 'Invalid form data.' };
    }

    const { username, password } = parsed.data;

    const user = allowedUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return { ...prevState, error: "Invalid username or password" };
    }
    
    // Bypassing API call and using hardcoded user data
    return { 
        message: 'Login successful', 
        user: { id: user.username, ...user }, // Use username as ID for mock
        error: null 
    };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { ...prevState, error: errorMessage };
  }
}
