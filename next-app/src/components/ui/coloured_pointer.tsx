"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useMotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

interface PointerProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  position?: { x: number; y: number };
}

/**
 * A custom pointer component that displays an animated cursor.
 * Add this as a child to any component to enable a custom pointer when hovering.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {PointerProps} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  position,
  ...props
}: PointerProps): JSX.Element {
  const x = useMotionValue(position?.x || 0);
  const y = useMotionValue(position?.y || 0);
  const [isActive, setIsActive] = useState<boolean>(true); // Always active when position prop is passed.

  useEffect(() => {
    if (position) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [position, x, y]);

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="transform-[translate(-50%,-50%)] pointer-events-none fixed z-50"
            style={{
              top: y,
              left: x,
              ...style,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            {...props}
          >
            {children || (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="1"
                viewBox="0 0 16 16"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "rotate-[-70deg] stroke-white text-black",
                  className,
                )}
              >
                <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}