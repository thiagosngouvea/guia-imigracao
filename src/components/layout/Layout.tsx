import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  headerTheme?: 'dark' | 'light';
}

export function Layout({ children, headerTheme = 'dark' }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Header theme={headerTheme} />
      <main>{children}</main>
    </div>
  );
}
