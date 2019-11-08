declare interface NativePlayer {
  play(): void,
  pause(): void,
  prepare(url: string): void,
  jump(timeInSeconds: number, shouldJumpBackwards: boolean): void
}

declare interface PlayerStatus {
  isReady?: boolean,
  isPlaying?: boolean,
  isLoading?: boolean,
}
