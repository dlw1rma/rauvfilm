import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 이벤트 스냅 장소 초기 데이터
  const locations = [
    {
      name: '동작대교',
      nameEn: 'Dongjak Bridge',
      slug: 'dongjak-bridge',
      description: '한강과 서울의 야경이 어우러지는 로맨틱한 장소입니다. 저녁 시간대에 촬영하면 아름다운 야경과 함께 특별한 영상을 담을 수 있습니다.',
      order: 1,
    },
    {
      name: '창경궁',
      nameEn: 'Changgyeonggung',
      slug: 'changgyeonggung',
      description: '조선 시대의 아름다운 고궁에서 클래식하고 우아한 분위기의 영상을 촬영할 수 있습니다. 한복 촬영에도 추천드립니다.',
      order: 2,
    },
    {
      name: '노을공원',
      nameEn: 'Noeul Park',
      slug: 'noeul-park',
      description: '하늘공원과 함께 서울에서 가장 아름다운 석양을 볼 수 있는 장소입니다. 골든아워 촬영에 최적의 장소입니다.',
      order: 3,
    },
    {
      name: '올림픽공원',
      nameEn: 'Olympic Park',
      slug: 'olympic-park',
      description: '넓은 잔디밭과 현대적인 조형물, 아름다운 자연이 어우러진 공간입니다. 계절마다 다른 분위기를 연출할 수 있습니다.',
      order: 4,
    },
  ];

  for (const location of locations) {
    const existing = await prisma.eventSnapLocation.findUnique({
      where: { slug: location.slug },
    });

    if (!existing) {
      await prisma.eventSnapLocation.create({
        data: location,
      });
      console.log(`Created location: ${location.name}`);
    } else {
      console.log(`Location already exists: ${location.name}`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
