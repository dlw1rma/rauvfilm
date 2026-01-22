import { cn } from "@/lib/utils";
import YouTubeFacade from "@/components/video/YouTubeFacade";

interface PricingCardProps {
  plan: {
    name: string;
    subtitle: string;
    originalPrice?: string;
    price: string;
    description: string;
    videoUrl?: string;
    features: string[];
    recommendations?: string[];
    gimbalNote?: string;
    popular?: boolean;
    isNew?: boolean;
  };
}

function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={cn(
        // 기본 카드 스타일 - 미니멀
        "group relative rounded-xl border p-6 md:p-8",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5",

        // 조건부 스타일
        plan.popular
          ? "border-accent/50 bg-background"
          : "border-border/50 bg-background/50 backdrop-blur-sm"
      )}
    >
      {/* 배지 */}
      {(plan.popular || plan.isNew) && (
        <div className="absolute -top-3 left-6">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full",
              plan.popular
                ? "bg-accent text-white"
                : "bg-foreground text-background"
            )}
          >
            {plan.popular ? "BEST" : "NEW"}
          </span>
        </div>
      )}

      {/* 상품 타입 라벨 */}
      <div className="mb-4 pt-2">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {plan.subtitle}
        </span>
      </div>

      {/* 상품명 */}
      <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>

      {/* 가격 영역 */}
      <div className="mb-6 pb-6 border-b border-border/50">
        <div className="flex items-baseline gap-2">
          {plan.originalPrice && (
            <span className="text-sm text-muted-foreground/60 line-through">
              {plan.originalPrice}
            </span>
          )}
          <span className="text-3xl md:text-4xl font-bold tracking-tight">
            {plan.price}
          </span>
          <span className="text-sm text-muted-foreground">원</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      {/* 미리보기 비디오 */}
      {plan.videoUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <YouTubeFacade
            videoId={extractVideoId(plan.videoUrl)}
            title={`${plan.name} 영상`}
          />
        </div>
      )}

      {/* 추천 대상 */}
      {plan.recommendations && plan.recommendations.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <h4 className="text-xs font-medium text-accent mb-3 uppercase tracking-wider">
            Recommended for
          </h4>
          <ul className="space-y-2">
            {plan.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="text-accent mt-0.5">-</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          {plan.gimbalNote && (
            <p className="mt-3 text-xs text-muted-foreground/70 italic">
              {plan.gimbalNote}
            </p>
          )}
        </div>
      )}

      {/* 기능 목록 */}
      <ul className="space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <div className="w-4 h-4 mt-0.5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-2.5 h-2.5 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-muted-foreground whitespace-pre-line">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
