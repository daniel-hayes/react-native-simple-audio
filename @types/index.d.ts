declare interface NativePlayer {
  play(): void,
  pause(): void,
  destroy(): void,
  prepare(url: string): string | void,
  jump(timeInSeconds: number, shouldJumpBackwards: boolean): void,
}

declare interface PlayerStatus {
  ready?: boolean,
  playing?: boolean,
  loading?: boolean,
  duration?: {
    seconds: number,
    formatted: string
  } | {}
}

declare interface EventBody {
  eventName: string,
  value: any
}
