import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-50 font-sans antialiased">
      {/* ── Global Background Infrastructure ── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/printly-background.jfif"
          alt="Printly network architecture background"
          fill
          className="object-cover opacity-[0.07] mix-blend-luminosity" 
          priority
        />
        
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-950/95 to-zinc-950/80" />
      </div>

      {/* ── Auth Page Viewport ── */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}