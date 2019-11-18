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

enum SupportedEvents {
  playerStatus = 'playerStatus',
  playerItemStatus = 'playerItemStatus'
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
      loading: false
    };
  }

  setStatus(changes: PlayerStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  private handlePlayerItemStatusChanges = (body: number) => {
    if (body === PlayerItemStatus.playing) {
      this.setStatus({ playing: true });
    }

    if (body === PlayerItemStatus.paused) {
      this.setStatus({ playing: false });
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

      // set listener for all status changes other than setting up player
      this.eventEmitter!.addListener(
        SupportedEvents.playerStatus,
        this.handlePlayerItemStatusChanges
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
      RCTAudioPlayer.destroy();
    }
  }
}

export default AudioPlayer;
