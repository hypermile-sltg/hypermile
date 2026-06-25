import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  if (!logos || logos.length === 0) return null;

  // Duplicate logos if they are too few to prevent gaps in the infinite slider
  let activeLogos = [...logos];
  while (activeLogos.length < 12) {
    activeLogos = [...activeLogos, ...logos];
  }

  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={48} duration={35} durationOnHover={100}>
        {activeLogos.map((logo, idx) => (
          <div
            key={`logo-wrapper-${logo.alt}-${idx}`}
            className="flex items-center justify-center h-8 md:h-12 w-24 md:w-32 shrink-0"
          >
            <img
              alt={logo.alt}
              className="pointer-events-none w-full h-full object-contain select-none dark:brightness-0 dark:invert"
              loading="lazy"
              src={logo.src}
            />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
