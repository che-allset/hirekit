import { Logo } from '@/components/Logo';
import { Photo } from '@/components/landing/Photo';

export function AuthShell({
  title,
  sub,
  children,
  photo = '/photos/candidate.jpg',
  caption = 'Your careers page, your website widget and every application in one place.',
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  photo?: string;
  caption?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-5xl leading-[0.95]">{title}</h1>
          <p className="mt-3 text-lg text-graphite-600">{sub}</p>
          <div className="mt-9">{children}</div>
        </div>
      </div>
      <div className="relative hidden p-4 lg:block">
        <Photo src={photo} alt="" className="h-full rounded-[18px]" sizes="45vw" priority />
        <p className="absolute bottom-10 left-10 right-10 max-w-sm rounded-[12px] bg-signal p-5 text-lg font-bold leading-snug text-graphite">
          {caption}
        </p>
      </div>
    </div>
  );
}
