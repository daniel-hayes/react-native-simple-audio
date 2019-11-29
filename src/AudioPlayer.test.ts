import { NativeModules, NativeEventEmitter } from 'react-native';
import AudioPlayer from './AudioPlayer';

jest.mock('react-native', () => {
  const { NativeEventEmitter } = require.requireActual('react-native');

  return {
    NativeEventEmitter,
    NativeModules: {
      AudioPlayer: {
        play: jest.fn(),
        pause: jest.fn(),
        prepare: jest.fn(),
        jump: jest.fn(),
        seek: jest.fn(),
        destroy: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      }
    }
  }
});

describe('AudioPlayer', () => {
  let NativeEventEmitterMock = new NativeEventEmitter(NativeModules.AudioPlayer);
  let player: AudioPlayer;

  beforeEach(() => {
    player = new AudioPlayer('foo.mp3', jest.fn(), NativeEventEmitterMock);
  });

  describe('toggleAudio', () => {
    it('should play the audio', () => {
      player.toggleAudio();
      expect(NativeModules.AudioPlayer.play).toHaveBeenCalled();
    });

    it('should pause the audio', () => {
      player.setStatus({ playing: true });
      player.toggleAudio();
      expect(NativeModules.AudioPlayer.pause).toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    const seconds = 0;

    it('should seek to position based on seconds input', () => {
      player.seek(seconds);
      expect(NativeModules.AudioPlayer.seek).toHaveBeenCalledWith(seconds);
    });
  });


  describe('seekForwards', () => {
    const seconds = 10;

    it('should call the jump method for going forward', () => {
      player.seekForwards(seconds);
      expect(NativeModules.AudioPlayer.jump).toHaveBeenCalledWith(seconds, false);
    });
  });

  describe('seekBackwards', () => {
    const seconds = 10;

    it('should call the jump method for going back', () => {
      player.seekBackwards(seconds);
      expect(NativeModules.AudioPlayer.jump).toHaveBeenCalledWith(seconds, true);
    });
  });

  describe('create', () => {
    it('successfully creates a player', async () => {
      const result = await new Promise((resolve) => {
        // can't do this async/await because this should be non-blocking
        // this needs to emit an event in the same test
        player.create()
          .then(() => {
            resolve(player.status);
          });

        NativeEventEmitterMock.emit('playerStatus', 1);
      });

      expect(result).toMatchObject({
        ready: true,
        playing: false,
        loading: false
      });
    });

    it('fails to create a player', async () => {
      const result = await new Promise((resolve) => {
        // can't do this async/await because this should be non-blocking
        // this needs to emit an event in the same test
        player.create()
          .catch(() => {
            resolve(player.status);
          });

        NativeEventEmitterMock.emit('playerStatus', -1);
      });

      // @TODO figure out a better way to error handle this in implementation
      expect(result).toMatchObject({
        ready: false,
        playing: false,
        loading: false
      });
    });

    it('should handle errors if url is not valid', async () => {
      NativeModules.AudioPlayer.prepare.mockReturnValueOnce('native url error');

      await expect(player.create()).rejects.toBeUndefined();

      expect(player.status).toMatchObject({
        ready: false,
        playing: false,
        loading: false
      });
    });
  });

  describe('progressPercentage', () => {
    it('returns current progress of a track', () => {
      // @ts-ignore
      expect(player.progressPercentage(15, 60)).toEqual(25);
    });

    it('returns current progress of an uninitialized', () => {
      // @ts-ignore
      expect(player.progressPercentage(0, 0)).toEqual(0);
    });

    it('returns 100 percent if complete', () => {
      // @ts-ignore
      expect(player.progressPercentage(65, 60)).toEqual(100);
    });
  });

  describe('handlePlayerInfo', () => {
    it('should set the duration status', () => {
      expect(player.status.duration).toMatchObject({ seconds: 0, formatted: '0:00' });

      // @ts-ignore
      player.handlePlayerInfo({ eventName: 'duration', value: 123 })

      expect(Object.keys(player.status.duration!)).toEqual(['seconds', 'formatted']);
    });

    it('should set the currentTime and progress status', () => {
      expect(player.status.currentTime).toMatchObject({ seconds: 0, formatted: '0:00' });
      expect(player.status.progress).toBe(0);

      // @ts-ignore
      player.handlePlayerInfo({ eventName: 'currentTime', value: 123 })

      expect(Object.keys(player.status.currentTime!)).toEqual(['seconds', 'formatted']);
      expect(player.status.progress).toBeDefined();
    });

    it('should update status when done playing', () => {
      player.status.duration = { seconds: 60, formatted: '' };
      expect(player.status.finished).toBe(false);
      // @ts-ignore
      // duration is equal to currentTime
      player.handlePlayerInfo({ eventName: 'currentTime', value: 60 })
      expect(player.status.finished).toBe(true);
    });


    it('should set the percent loaded', () => {
      expect(player.status.percentLoaded).toBe(0)

      // @ts-ignore
      player.handlePlayerInfo({ eventName: 'loadedTime', value: 30 })

      expect(player.status.percentLoaded).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should remove all event emitters', () => {
      const [playerStatus, playerItemStatus, playerInfo] = ['playerStatus', 'playerItemStatus', 'playerInfo'];

      NativeEventEmitterMock.addListener(playerStatus, jest.fn);
      NativeEventEmitterMock.addListener(playerItemStatus, jest.fn);
      NativeEventEmitterMock.addListener(playerInfo, jest.fn);

      expect(NativeEventEmitterMock.listeners(playerStatus)).toHaveLength;
      expect(NativeEventEmitterMock.listeners(playerItemStatus)).toHaveLength;
      expect(NativeEventEmitterMock.listeners(playerInfo)).toHaveLength;

      player.destroy();

      expect(NativeEventEmitterMock.listeners(playerStatus)).toHaveLength(0);
      expect(NativeEventEmitterMock.listeners(playerItemStatus)).toHaveLength(0);
      expect(NativeEventEmitterMock.listeners(playerInfo)).toHaveLength(0);
    });

    it('should destroy the native player', () => {
      player.destroy();
      expect(NativeModules.AudioPlayer.destroy).toHaveBeenCalled();
    });
  });
});
