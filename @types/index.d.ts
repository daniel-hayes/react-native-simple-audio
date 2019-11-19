declare interface NativePlayer {
  play(): void,
  pause(): void,
  destroy(): void,
  prepare(url: string): string | void,
  seek(timeInSeconds: number): void,
  jump(timeInSeconds: number, shouldJumpBackwards: boolean): void,
}

declare interface PlayerStatus {
  ready?: boolean,
  playing?: boolean,
  loading?: boolean,
  currentTime?: {
    seconds: number,
    formatted: string
  },
  duration?: {
    seconds: number,
    formatted: string
  },
  progress?: number,
  percentLoaded?: number
}

declare interface EventBody {
  eventName: string,
  value: any
}
