import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

async function getEventSnapLocations() {
  try {
    const locations = await prisma.eventSnapLocation.findMany({
      where: { isVisible: true },
      select: {
        name: true,
        slug: true,
      },
      orderBy: { order: 'asc' },
    });
    return locations;
  } catch (error) {
    console.error('Failed to fetch event snap locations:', error);
    return [];
  }
}

export default async function Header({ locale }: { locale?: Locale }) {
  const eventSnapLocations = await getEventSnapLocations();
  const currentLocale = locale || 'ko';
  const t = await getDictionary(currentLocale);

  return <HeaderClient eventSnapLocations={eventSnapLocations} locale={currentLocale} translations={{ ...t.nav, siteName: t.common.siteName }} />;
}
