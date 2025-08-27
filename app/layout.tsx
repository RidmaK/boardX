import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { UsersProvider } from '@/contexts/UsersContext';
import { TasksProvider } from '@/contexts/TasksContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Modern admin dashboard with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <CalendarProvider>
              <ChatProvider>
                <UsersProvider>
                  <TasksProvider>
                    {children}
                  </TasksProvider>
                </UsersProvider>
              </ChatProvider>
            </CalendarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}