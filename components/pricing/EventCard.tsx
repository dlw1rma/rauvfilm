interface EventItem {
  label: string;
  price: string;
  detail: string;
}

interface EventCardProps {
  title: string;
  description: string;
  items: EventItem[];
  badge?: string;
}

export default function EventCard({
  title,
  description,
  items,
  badge,
}: EventCardProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-background p-6 transition-all duration-300 hover:border-border">
      <div className="flex items-center gap-2 mb-4">
        {badge && (
          <span className="px-2.5 py-1 text-xs font-medium bg-accent text-white rounded-full">
            {badge}
          </span>
        )}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30"
          >
            <div>
              <span className="text-sm font-medium">{item.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.detail}
              </p>
            </div>
            <span className="text-accent font-bold">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
