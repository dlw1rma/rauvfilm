import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { isValidLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');
  return {
    title: t.privacy.metaTitle,
    description: t.privacy.metaDescription,
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getDictionary(isValidLocale(locale) ? locale : 'ko');

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{t.privacy.pageTitle}</h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <p className="mb-6">{t.privacy.intro}</p>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article1Title}</h2>
            <p className="mb-2">{t.privacy.article1Intro}</p>
            <ol className="list-decimal pl-6 space-y-3 mt-2">
              <li>
                <strong>{t.privacy.article1Purpose1Title}</strong><br />
                {t.privacy.article1Purpose1Desc}
              </li>
              <li>
                <strong>{t.privacy.article1Purpose2Title}</strong><br />
                {t.privacy.article1Purpose2Desc}
              </li>
              <li>
                <strong>{t.privacy.article1Purpose3Title}</strong><br />
                {t.privacy.article1Purpose3Desc}
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article2Title}</h2>
            <p className="mb-2">{t.privacy.article2Para1}</p>
            <p className="mb-2">{t.privacy.article2Para2}</p>
            <ol className="list-decimal pl-6 space-y-3 mt-2">
              <li>
                <strong>{t.privacy.article2Retention1Title}</strong><br />
                {t.privacy.article2Retention1Desc}
                <ol className="list-decimal pl-6 mt-1 space-y-1">
                  <li>{t.privacy.article2Retention1Sub1}</li>
                  <li>{t.privacy.article2Retention1Sub2}</li>
                </ol>
              </li>
              <li>
                <strong>{t.privacy.article2Retention2Title}</strong><br />
                {t.privacy.article2Retention2Desc}
                <ol className="list-decimal pl-6 mt-1 space-y-1">
                  <li>
                    {t.privacy.article2Retention2Law1Intro}
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>{t.privacy.article2Retention2Law1Item1}</li>
                      <li>{t.privacy.article2Retention2Law1Item2}</li>
                      <li>{t.privacy.article2Retention2Law1Item3}</li>
                    </ul>
                  </li>
                  <li>
                    {t.privacy.article2Retention2Law2Intro}
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>{t.privacy.article2Retention2Law2Item1}</li>
                      <li>{t.privacy.article2Retention2Law2Item2}</li>
                    </ul>
                  </li>
                </ol>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article3Title}</h2>
            <p className="mb-2">{t.privacy.article3Para1}</p>
            <p className="mb-2">{t.privacy.article3Para2}</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>{t.privacy.article3Provider}</li>
              <li>{t.privacy.article3Purpose}</li>
              <li>{t.privacy.article3Items}</li>
              <li>{t.privacy.article3Retention}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article5Title}</h2>
            <p className="mb-2">{t.privacy.article5Para1}</p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>{t.privacy.article5Right1}</li>
              <li>{t.privacy.article5Right2}</li>
              <li>{t.privacy.article5Right3}</li>
              <li>{t.privacy.article5Right4}</li>
            </ol>
            <p className="mt-2">{t.privacy.article5Para2}</p>
            <p className="mt-2">{t.privacy.article5Para3}</p>
            <p className="mt-2">{t.privacy.article5Para4}</p>
            <p className="mt-2">{t.privacy.article5Para5}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article6Title}</h2>
            <p className="mb-2">{t.privacy.article6Intro}</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                <strong>{t.privacy.article6ItemTitle}</strong><br />
                {t.privacy.article6ItemDesc}
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article7Title}</h2>
            <p className="mb-2">{t.privacy.article7Para1}</p>
            <p className="mb-2">{t.privacy.article7Para2}</p>
            <p className="mb-2">{t.privacy.article7Para3}</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                <strong>{t.privacy.article7Method1Title}</strong><br />
                {t.privacy.article7Method1Desc}
              </li>
              <li>
                <strong>{t.privacy.article7Method2Title}</strong><br />
                {t.privacy.article7Method2Desc}
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article8Title}</h2>
            <p className="mb-2">{t.privacy.article8Intro}</p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>{t.privacy.article8Measure1}</li>
              <li>{t.privacy.article8Measure2}</li>
              <li>{t.privacy.article8Measure3}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article9Title}</h2>
            <p className="mb-2">{t.privacy.article9Para1}</p>
            <p className="mb-2">{t.privacy.article9Para2}</p>
            <p className="mb-2">{t.privacy.article9Para3}</p>
            <div className="mt-4 space-y-2">
              <p className="font-semibold">{t.privacy.article9WebTitle}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t.privacy.article9WebChrome}</li>
                <li>{t.privacy.article9WebEdge}</li>
              </ul>
              <p className="font-semibold mt-3">{t.privacy.article9MobileTitle}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t.privacy.article9MobileChrome}</li>
                <li>{t.privacy.article9MobileSafari}</li>
                <li>{t.privacy.article9MobileSamsung}</li>
              </ul>
            </div>
            <p className="mt-4">{t.privacy.article9Para4}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article10Title}</h2>
            <p className="mb-2">{t.privacy.article10Intro}</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-semibold mb-2">{t.privacy.article10OfficerTitle}</p>
                <ul className="list-none space-y-1 pl-4">
                  <li>{t.privacy.article10OfficerName}</li>
                  <li>{t.privacy.article10OfficerPosition}</li>
                  <li>{t.privacy.article10OfficerContact}</li>
                  <li>{t.privacy.article10OfficerNote}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">{t.privacy.article10ManagerTitle}</p>
                <ul className="list-none space-y-1 pl-4">
                  <li>{t.privacy.article10ManagerName}</li>
                  <li>{t.privacy.article10ManagerPosition}</li>
                  <li>{t.privacy.article10ManagerContact}</li>
                </ul>
              </div>
            </div>
            <p className="mt-4">{t.privacy.article10Para2}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article11Title}</h2>
            <p className="mb-2">{t.privacy.article11Intro}</p>
            <div className="mt-4">
              <p className="font-semibold mb-2">{t.privacy.article11HandlerTitle}</p>
              <ul className="list-none space-y-1 pl-4">
                <li>{t.privacy.article11HandlerName}</li>
                <li>{t.privacy.article11HandlerPosition}</li>
                <li>{t.privacy.article11HandlerContact}</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article12Title}</h2>
            <p className="mb-2">{t.privacy.article12Intro}</p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>{t.privacy.article12Agency1}</li>
              <li>{t.privacy.article12Agency2}</li>
              <li>{t.privacy.article12Agency3}</li>
              <li>{t.privacy.article12Agency4}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.privacy.article13Title}</h2>
            <p>{t.privacy.article13Content}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
