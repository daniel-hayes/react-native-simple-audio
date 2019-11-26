import { NativeEventEmitter, NativeModules, EventSubscriptionVendor } from 'react-native';
import Audio from './Audio';

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
  duration = 'duration',
  loadedTime = 'loadedTime'
};

enum SupportedEvents {
  playerStatus = 'playerStatus',
  playerItemStatus = 'playerItemStatus',
  playerInfo = 'playerInfo'
};

class AudioPlayer extends Audio {
  url: string;
  status: PlayerStatus;
  private eventEmitter: NativeEventEmitter | undefined;

  constructor(
    url: string,
    statusHandler: StatusHandler,
    eventEmitter: NativeEventEmitter = new NativeEventEmitter(RCTAudioPlayer)
  ) {
    super(statusHandler);

    this.url = url;

    this.eventEmitter = eventEmitter;

    this.status = {
      ready: false,
      playing: false,
      loading: false,
      duration: this.formatTime(0),
      currentTime: this.formatTime(0),
      progress: 0,
      percentLoaded: 0
    };
  }

  private progressPercentage = (currentTimeInSeconds: number, duration: number) => {
    if (duration > 0) {
      const percent = (currentTimeInSeconds / duration) * 100;
      return percent > 100 ? 100 : percent;
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

    if (body.eventName === PlayerInfo.loadedTime) {
      this.setStatus({
        percentLoaded: this.progressPercentage(body.value, this.status.duration!.seconds)
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

  seek = (timeInSeconds: number) => {
    RCTAudioPlayer.seek(timeInSeconds);
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
