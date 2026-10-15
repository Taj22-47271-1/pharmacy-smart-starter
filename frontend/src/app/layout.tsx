import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pharmacy Smart | Inventory Starter',
  description: 'Learning starter for pharmacy inventory and smart reorder workflows',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
