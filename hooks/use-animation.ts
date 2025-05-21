"use client"

import { useState, useEffect } from "react"

type AnimationState = "idle" | "entering" | "entered" | "exiting" | "exited"

interface UseAnimationOptions {
  duration?: number
  onEnter?: () => void
  onEntered?: () => void
  onExit?: () => void
  onExited?: () => void
}

export function useAnimation(initialVisible = false, options: UseAnimationOptions = {}) {
  const [visible, setVisible] = useState(initialVisible)
  const [animationState, setAnimationState] = useState<AnimationState>(initialVisible ? "entered" : "exited")

  const { duration = 300, onEnter, onEntered, onExit, onExited } = options

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (visible && animationState === "exited") {
      setAnimationState("entering")
      onEnter?.()

      timer = setTimeout(() => {
        setAnimationState("entered")
        onEntered?.()
      }, duration)
    } else if (!visible && animationState === "entered") {
      setAnimationState("exiting")
      onExit?.()

      timer = setTimeout(() => {
        setAnimationState("exited")
        onExited?.()
      }, duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [visible, animationState, duration, onEnter, onEntered, onExit, onExited])

  const show = () => setVisible(true)
  const hide = () => setVisible(false)
  const toggle = () => setVisible((prev) => !prev)

  return {
    visible,
    animationState,
    show,
    hide,
    toggle,
    isEntering: animationState === "entering",
    isEntered: animationState === "entered",
    isExiting: animationState === "exiting",
    isExited: animationState === "exited",
  }
}
