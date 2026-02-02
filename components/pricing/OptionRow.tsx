interface OptionRowProps {
  option: {
    name: string;
    description: string;
    price: string;
  };
}

export default function OptionRow({ option }: OptionRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium mb-0.5">{option.name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {option.description}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-accent">{option.price}원</p>
      </div>
    </div>
  );
}
