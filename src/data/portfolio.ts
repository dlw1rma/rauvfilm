// 포트폴리오 데이터
// 새로운 영상을 추가하려면 이 배열에 항목을 추가하세요.

export interface PortfolioItem {
  id: number;
  title: string;        // 한글 제목 (예: "더링크 호텔")
  titleEn: string;      // 영문 제목 (예: "The Link Hotel")
  camera: string;       // 촬영 구성 (예: "2인3캠", "2인2캠")
  youtubeId: string;    // 유튜브 영상 ID (예: "KfMCApWc5xE")
  thumbnailUrl?: string; // 커스텀 썸네일 URL (선택사항, 없으면 유튜브 썸네일 사용)
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "더링크호텔",
    titleEn: "The Link Hotel",
    camera: "2인3캠",
    youtubeId: "KfMCApWc5xE",
  },
  {
    id: 2,
    title: "그랜드워커힐",
    titleEn: "Grand Walkerhill Seoul",
    camera: "2인2캠",
    youtubeId: "qg0_FinB6EE",
  },
  {
    id: 3,
    title: "포시즌스호텔",
    titleEn: "Four Seasons Seoul",
    camera: "2인3캠",
    youtubeId: "YMfYIi9dLJY",
  },
  {
    id: 4,
    title: "시그니엘서울",
    titleEn: "Signiel Seoul",
    camera: "2인2캠",
    youtubeId: "zXtsGAkyeIo",
  },
  {
    id: 5,
    title: "반얀트리클럽",
    titleEn: "Banyan Tree Club",
    camera: "2인3캠",
    youtubeId: "", // 유튜브 ID 추가 필요
  },
  {
    id: 6,
    title: "JW메리어트",
    titleEn: "JW Marriott",
    camera: "2인2캠",
    youtubeId: "", // 유튜브 ID 추가 필요
  },
  {
    id: 7,
    title: "파라다이스시티",
    titleEn: "Paradise City",
    camera: "2인3캠",
    youtubeId: "", // 유튜브 ID 추가 필요
  },
  {
    id: 8,
    title: "서울신라호텔",
    titleEn: "The Shilla Seoul",
    camera: "2인2캠",
    youtubeId: "", // 유튜브 ID 추가 필요
  },
];

// 히어로 슬라이더용 영상 (유튜브 ID가 있는 항목만 필터링)
export const heroVideos = portfolioItems.filter(item => item.youtubeId);

// 유튜브 썸네일 URL 생성 헬퍼 함수
export function getYoutubeThumbnail(youtubeId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  if (!youtubeId) return '';
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}
