interface DiscountCardProps {
  title: string;
  amount: string;
  description: string;
}

export default function DiscountCard({
  title,
  amount,
  description,
}: DiscountCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-5 text-center transition-all duration-300 hover:border-accent/30 hover:-translate-y-1">
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <p className="text-2xl font-bold text-accent mb-2">{amount}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
