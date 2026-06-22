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
  const half = Math.ceil(logos.length / 2);
  const topLogos = logos.slice(0, half);
  const bottomLogos = logos.slice(half);

  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      {/* Top Row - Infinite to the right */}
      <InfiniteSlider gap={42} reverse duration={40} durationOnHover={120}>
        {topLogos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
            height={logo.height || "auto"}
            key={`logo-top-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </InfiniteSlider>

      {/* Bottom Row - Infinite to the left */}
      <InfiniteSlider gap={42} reverse={false} duration={40} durationOnHover={120}>
        {bottomLogos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
            height={logo.height || "auto"}
            key={`logo-bottom-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
