const COLORS = ['#4ade80', '#ffffff', '#000000']

export function fireConfetti(opts: {
  particleCount?: number
  spread?: number
  origin?: { x?: number; y?: number }
  scalar?: number
} = {}) {
  void import('canvas-confetti').then(({ default: confetti }) => {
    confetti({ colors: COLORS, ...opts })
  })
}
