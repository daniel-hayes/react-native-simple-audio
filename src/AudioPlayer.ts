import { NativeEventEmitter, NativeModules, EventSubscriptionVendor } from 'react-native';
const RCTAudioPlayer:
  NativePlayer & EventSubscriptionVendor = NativeModules.AudioPlayer;

enum PlayerSetup {
  failed = -1,
  unknown = 0,
  ready = 1
};

enum SupportedEvents {
  initialize = 'initialize',
  playerStatus = 'playerStatus'
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
      isReady: false,
      isPlaying: false,
      isLoading: false
    };
  }

  setStatus(changes: PlayerStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  private handlePlayerStatusChanges = (body: string) => {
    if (body === 'PLAYER PLAYING') {
      this.setStatus({ isPlaying: true });
    }

    if (body === 'PLAYER PAUSED') {
      this.setStatus({ isPlaying: false });
    }
  };

  create() {
    return new Promise((resolve, reject) => {
      RCTAudioPlayer.prepare(this.url);

      // set listener for all status changes other than setting up player
      this.eventEmitter!.addListener(
        SupportedEvents.playerStatus,
        this.handlePlayerStatusChanges
      );

      // wait for player to be created
      this.eventEmitter!.addListener(SupportedEvents.initialize, body => {
        if (body === PlayerSetup.ready) {
          this.setStatus({
            isReady: true,
            isLoading: false
          });

          resolve();
        }

        if (body === PlayerSetup.failed) {
          this.setStatus({
            isLoading: false
          });

          reject();
        }
      });
    });
  }

  toggleAudio = () => {
    if (this.status.isPlaying) {
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
      this.eventEmitter.removeAllListeners(SupportedEvents.initialize);
    }
  }
}

export default AudioPlayer;
