import { getExchange } from "@/config/exchanges";

interface ExchangeBadgeProps {
  exchangeId: string;
}

export default function ExchangeBadge({ exchangeId }: ExchangeBadgeProps) {
  const exchange = getExchange(exchangeId);
  if (!exchange) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-border-light text-xs font-medium text-text-secondary">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: exchange.color }}
      />
      {exchange.name}
    </span>
  );
}
