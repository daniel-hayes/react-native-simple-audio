declare interface NativePlayer {
  play(): void,
  pause(): void,
  destroy(): void,
  prepare(url: string): string | void,
  jump(timeInSeconds: number, shouldJumpBackwards: boolean): void,
}

declare interface PlayerStatus {
  isReady?: boolean,
  isPlaying?: boolean,
  isLoading?: boolean,
}
