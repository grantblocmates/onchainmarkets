import { getExchange } from "@/config/exchanges";

interface ExchangeBadgeProps {
  exchangeId: string;
}

export default function ExchangeBadge({ exchangeId }: ExchangeBadgeProps) {
  const exchange = getExchange(exchangeId);
  if (!exchange) return null;

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-card border border-border text-sm font-medium text-text-primary">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: exchange.color }}
      />
      {exchange.name}
    </span>
  );
}
