'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);

  useEffect(() => {
    const size = direction === 'horizontal' ? width : height;
    if (size === 0) return;

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const startValue = translation.get();
    const remainingDistance = Math.abs(startValue - to);
    const totalDistance = Math.abs(from - to);
    const progress = totalDistance > 0 ? remainingDistance / totalDistance : 1;
    const remainingDuration = currentDuration * progress;

    let activeLoopControls: any = null;

    const controls = animate(translation, [startValue, to], {
      ease: 'linear',
      duration: remainingDuration,
      onComplete: () => {
        activeLoopControls = animate(translation, [from, to], {
          ease: 'linear',
          duration: currentDuration,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: 0,
          onRepeat: () => {
            translation.set(from);
          },
        });
      },
    });

    return () => {
      controls.stop();
      if (activeLoopControls) {
        activeLoopControls.stop();
      }
    };
  }, [
    translation,
    currentDuration,
    width,
    height,
    gap,
    direction,
    reverse,
  ]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
