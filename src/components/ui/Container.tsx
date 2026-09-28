import { cn } from "@/lib/utils/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "main";
  width?: "default" | "narrow" | "wide" | "full";
};

const widthClasses = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

export function Container({
  as: Component = "div",
  width = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widthClasses[width],
        className,
      )}
      {...props}
    />
  );
}
