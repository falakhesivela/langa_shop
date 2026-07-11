import type { ReactNode } from "react";

/** Shared shell for static info/policy pages (contact, FAQ, delivery,
 * returns, privacy, terms) so they all read as one family. */
export function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      {intro ? (
        <p className="mt-4 text-muted-foreground">{intro}</p>
      ) : null}
      <div className="mt-10 space-y-10">{children}</div>
    </main>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
    </section>
  );
}
