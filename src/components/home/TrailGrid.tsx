import { TrailCard } from "@/components/home/TrailCard";
import type { Trail } from "@/lib/navigation/trails";

type TrailGridProps = {
  trails: Trail[];
};

export function TrailGrid({ trails }: TrailGridProps) {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:gap-6">
      {trails.map((trail, index) => (
        <li
          key={trail.id}
          className="animate-fade-up min-w-0"
          style={{ animationDelay: `${120 + index * 70}ms` }}
        >
          <TrailCard trail={trail} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
