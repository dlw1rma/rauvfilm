import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.terms.metaTitle,
    description: t.terms.metaDescription,
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{t.terms.pageTitle}</h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article1Title}</h2>
            <p>{t.terms.article1Content}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article2Title}</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t.terms.article2Item1}</li>
              <li>{t.terms.article2Item2}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article3Title}</h2>
            <p className="mb-2">{t.terms.article3Intro}</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>{t.terms.article3Item1}</li>
              <li>{t.terms.article3Item2}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article4Title}</h2>
            <p className="mb-2">{t.terms.article4Intro}</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{t.terms.article4Note1}</li>
              <li>{t.terms.article4Note2}</li>
              <li>{t.terms.article4Note3}</li>
              <li>{t.terms.article4Note4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article5Title}</h2>
            <p className="mb-2">{t.terms.article5Intro}</p>
            <div className="mt-4">
              <p className="font-semibold mb-2">{t.terms.article5CompTitle}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t.terms.article5Comp1}</li>
                <li>{t.terms.article5Comp2}</li>
                <li>{t.terms.article5Comp3}</li>
                <li>{t.terms.article5Comp4}</li>
                <li>{t.terms.article5Comp5}</li>
              </ul>
            </div>
            <p className="mt-4">{t.terms.article5Disclaimer}</p>
            <p className="mt-2">{t.terms.article5Unable}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article6Title}</h2>
            <p>{t.terms.article6Line1}</p>
            <p>{t.terms.article6Line2}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.terms.article7Title}</h2>
            <p>{t.terms.article7Line1}</p>
            <p>{t.terms.article7Line2}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
