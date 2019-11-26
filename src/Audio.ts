class Audio {
  status: AudioStatus;
  protected statusHandler: StatusHandler;

  constructor(statusHandler: StatusHandler) {
    this.statusHandler = statusHandler;
    this.status = {};
  }

  setStatus(changes: AudioStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  protected formatTime = (timeInseconds: number) => {
    const minutes = Math.floor(timeInseconds / 60);
    const seconds = Math.floor(timeInseconds % 60);

    return {
      seconds: timeInseconds,
      formatted: `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`
    }
  }
}

export default Audio;
