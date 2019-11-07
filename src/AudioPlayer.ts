import { NativeEventEmitter, NativeModules } from 'react-native';
const { AudioPlayer: RCTAudioPlayer } = NativeModules;

enum PlayerSetup {
  failed = -1,
  unknown = 0,
  ready = 1
};

interface StatusHandler {
  (status: PlayerStatus): void
};

class AudioPlayer {
  url: string;
  statusHandler: StatusHandler;
  status: PlayerStatus;
  eventEmitter: NativeEventEmitter | undefined;

  constructor(url: string, statusHandler: StatusHandler) {
    this.url = url;

    this.statusHandler = statusHandler;

    this.status = {
      isReady: false,
      isPlaying: false,
      isLoading: false
    };

    this.eventEmitter;
  }

  setStatus(changes: PlayerStatus) {
    this.status = {
      ...this.status,
      ...changes
    };

    this.statusHandler(this.status);
  }

  handlePlayerStatusChanges = (body: string) => {
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
      this.eventEmitter = new NativeEventEmitter(RCTAudioPlayer);

      // set listener for all status changes other than setting up player
      this.eventEmitter.addListener(
        'playerStatus',
        this.handlePlayerStatusChanges
      );

      // wait for player to be created
      this.eventEmitter.addListener('initialize', body => {
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
    // @TODO add destroy method to Swift file
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners();
    }
  }
}

export default AudioPlayer;
