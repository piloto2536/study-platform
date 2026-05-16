// src/app/auth/layout.tsx
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-ink">
          StudyFlow
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </div>
    </div>
  );
}
