import Image from 'next/image';
import { cn } from '@/lib/utils';

/** A brand-treated photo (graphite duotone) that fills its box. */
export function Photo({
  src,
  alt,
  className,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  position = 'center',
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  position?: string;
}) {
  return (
    <div className={cn('duotone', className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
