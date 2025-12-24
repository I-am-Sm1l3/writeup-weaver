import type {Metadata} from 'next';
import './globals.css';
import '../styles/prism-night-owl.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-code',
});

export const metadata: Metadata = {
  title: 'Sm1l3\'s Writeup Weaver',
  description: 'Create amazing technical posts with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
