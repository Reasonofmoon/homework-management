"use client"

import { type HTMLMotionProps, motion as framerMotion } from "framer-motion"

type MotionProps = HTMLMotionProps<"div">

export const motion = {
  div: (props: MotionProps) => <framerMotion.div {...props} />,
  span: (props: HTMLMotionProps<"span">) => <framerMotion.span {...props} />,
  button: (props: HTMLMotionProps<"button">) => <framerMotion.button {...props} />,
  ul: (props: HTMLMotionProps<"ul">) => <framerMotion.ul {...props} />,
  li: (props: HTMLMotionProps<"li">) => <framerMotion.li {...props} />,
}

