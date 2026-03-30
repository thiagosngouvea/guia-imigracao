import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  headerTheme?: 'dark' | 'light';
  showHeader?: boolean;
}

export function Layout({ children, headerTheme = 'dark', showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {showHeader && <Header theme={headerTheme} />}
      <main>{children}</main>
    </div>
  );
}
