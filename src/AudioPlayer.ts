import { NativeEventEmitter, NativeModules, EventSubscriptionVendor } from 'react-native';

const RCTAudioPlayer:
  NativePlayer & EventSubscriptionVendor = NativeModules.AudioPlayer;

enum PlayerSetupStatus {
  failed = -1,
  unknown = 0,
  ready = 1
};

enum PlayerItemStatus {
  buffering = 0,
  buffered = 1,
  playing = 2,
  paused = 3,
  waiting = 4
};

enum PlayerInfo {
  currentTime = 'currentTime',
  duration = 'duration'
};

enum SupportedEvents {
  playerStatus = 'playerStatus',
  playerItemStatus = 'playerItemStatus',
  playerInfo = 'playerInfo'
};

interface StatusHandler {
  (status: PlayerStatus): void
};

class AudioPlayer {
  url: string;
  status: PlayerStatus;
  private statusHandler: StatusHandler;
  private eventEmitter: NativeEventEmitter | undefined;

  constructor(
    url: string,
    statusHandler: StatusHandler,
    eventEmitter: NativeEventEmitter = new NativeEventEmitter(RCTAudioPlayer)
  ) {
    this.url = url;

    this.statusHandler = statusHandler;

    this.eventEmitter = eventEmitter;

    this.status = {
      ready: false,
      playing: false,
      loading: false,
      duration: this.formatTime(0),
      currentTime: this.formatTime(0),
      progress: 0
    };
  }

  setStatus(changes: PlayerStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  private formatTime = (timeInseconds: number) => {
    const minutes = Math.floor(timeInseconds / 60);
    const seconds = Math.floor(timeInseconds % 60);

    return {
      seconds: timeInseconds,
      formatted: `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`
    }
  }

  private progressPercentage = (currentTimeInSeconds: number, duration: number) => {
    if (duration > 0) {
      return (currentTimeInSeconds / duration) * 100;
    }

    return 0;
  }

  private handlePlayerItemStatusChanges = (body: number) => {
    if (body === PlayerItemStatus.playing) {
      this.setStatus({ playing: true });
    }

    if (body === PlayerItemStatus.paused) {
      this.setStatus({ playing: false });
    }
  };

  private handlePlayerInfo = (body: EventBody) => {
    if (body.eventName === PlayerInfo.duration) {
      this.setStatus({ duration: this.formatTime(body.value) });
    }

    if (body.eventName === PlayerInfo.currentTime) {
      const currentTimeInSeconds = body.value;

      this.setStatus({
        currentTime: this.formatTime(currentTimeInSeconds),
        progress: this.progressPercentage(currentTimeInSeconds, this.status.duration!.seconds)
      });
    }
  };

  create() {
    return new Promise((resolve, reject) => {
      const urlError = RCTAudioPlayer.prepare(this.url);

      if (urlError) {
        // problem with URL and player was never created
        this.setStatus({
          loading: false
        });

        reject();
      }

      // set listener for all status changes on the asset
      this.eventEmitter!.addListener(
        SupportedEvents.playerItemStatus,
        this.handlePlayerItemStatusChanges
      );

      // set listener for getting player info
      this.eventEmitter!.addListener(
        SupportedEvents.playerInfo,
        this.handlePlayerInfo
      );

      // wait for player to be created
      this.eventEmitter!.addListener(SupportedEvents.playerStatus, (body: number) => {
        if (body === PlayerSetupStatus.ready) {
          this.setStatus({
            ready: true,
            loading: false
          });

          resolve();
        }

        if (body === PlayerSetupStatus.failed) {
          this.setStatus({
            loading: false
          });

          reject();
        }
      });
    });
  }

  toggleAudio = () => {
    if (this.status.playing) {
      RCTAudioPlayer.pause();
    } else {
      RCTAudioPlayer.play();
    }
  };

  seekForwards = (timeInSeconds: number) => {
    RCTAudioPlayer.jump(timeInSeconds, false);
  };

  seekBackwards = (timeInSeconds: number) => {
    RCTAudioPlayer.jump(timeInSeconds, true);
  };

  destroy() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners(SupportedEvents.playerStatus);
      this.eventEmitter.removeAllListeners(SupportedEvents.playerItemStatus);
      this.eventEmitter.removeAllListeners(SupportedEvents.playerInfo);

      RCTAudioPlayer.destroy();
    }
  }
}

export default AudioPlayer;
