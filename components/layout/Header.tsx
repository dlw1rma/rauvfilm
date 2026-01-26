import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

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

export default async function Header() {
  const eventSnapLocations = await getEventSnapLocations();
  
  return <HeaderClient eventSnapLocations={eventSnapLocations} />;
}
