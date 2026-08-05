import { cn } from "@/lib/utils";

export function Progresso({
  valor,
  cor = "primary",
  className,
}: {
  valor: number;
  cor?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, valor));
  const cores = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", cores[cor])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function GaugeIndicador({
  valor,
  rotulo,
  grande = false,
}: {
  valor: number;
  rotulo?: string;
  grande?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(valor)));
  const cor =
    clamped >= 75 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : clamped >= 25 ? "#f97316" : "#ef4444";
  const r = grande ? 56 : 34;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: r * 2, height: r * 2 }}>
        <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
          <circle
            cx={r}
            cy={r}
            r={r - 4}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={7}
          />
          <circle
            cx={r}
            cy={r}
            r={r - 4}
            fill="none"
            stroke={cor}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${r} ${r})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: grande ? 26 : 18, fontWeight: 700 }}
        >
          {clamped}%
        </div>
      </div>
      {rotulo && <span className="text-xs text-muted-foreground">{rotulo}</span>}
    </div>
  );
}

export function NotaAnel({
  nota,
  tamanho = "md",
}: {
  nota: number;
  tamanho?: "sm" | "md" | "lg";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(nota)));
  const tamanhos = { sm: 44, md: 60, lg: 80 };
  const size = tamanhos[tamanho];
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const cor = clamped >= 75 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ fontSize: tamanho === "sm" ? 13 : tamanho === "md" ? 16 : 22, color: cor }}
      >
        {clamped}
      </div>
    </div>
  );
}