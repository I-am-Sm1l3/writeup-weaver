import { Icons } from './icons';

export function Header() {
  return (
    <header className="flex h-16 items-center border-b px-4">
      <div className="flex items-center gap-2">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Sm1l3's Writeup Weaver
        </h1>
      </div>
    </header>
  );
}
