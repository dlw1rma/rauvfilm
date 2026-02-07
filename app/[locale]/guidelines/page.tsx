import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.guidelines.metaTitle,
    description: t.guidelines.metaDescription,
  };
}

export default async function GuidelinesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{t.guidelines.pageTitle}</h1>

        <div className="prose prose-invert max-w-none space-y-10 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.guidelines.section1Title}</h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>{t.guidelines.pre1}</li>
              <li>{t.guidelines.pre2}</li>
              <li>
                {t.guidelines.pre3}
                <p className="text-sm mt-1">{t.guidelines.pre3Note}</p>
              </li>
              <li>{t.guidelines.pre4}</li>
              <li>{t.guidelines.pre5}</li>
              <li>{t.guidelines.pre6}</li>
              <li>{t.guidelines.pre7}</li>
              <li>{t.guidelines.pre8}</li>
              <li>{t.guidelines.pre9}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.guidelines.section2Title}</h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>{t.guidelines.post1}</li>
              <li>{t.guidelines.post2}</li>
              <li>{t.guidelines.post3}</li>
              <li>{t.guidelines.post4}</li>
              <li>{t.guidelines.post5}</li>
              <li>{t.guidelines.post6}</li>
              <li>{t.guidelines.post7}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
