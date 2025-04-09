export type User = {
  id: number;
  email: string;
  firstname: string;
  role: 'student' | 'teacher' | 'admin';
  class?: string;
  subject?: string;
  token: string;
  createdAt: string;
};
