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
        destroy: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      }
    }
  }
});

describe('AudioPlayer', () => {
  const statusHandler = jest.fn();
  let NativeEventEmitterMock = new NativeEventEmitter(NativeModules.AudioPlayer);
  let player: AudioPlayer;

  beforeEach(() => {
    player = new AudioPlayer('foo.mp3', statusHandler, NativeEventEmitterMock);
    statusHandler.mockReset();
  });

  describe('setStatus', () => {
    it('should update local status', () => {
      const initialStatus = player.status;
      const updatedStatus = { ready: true }
      player.setStatus(updatedStatus);
      expect(player.status).not.toEqual(initialStatus);
      expect(player.status).toEqual({ ...initialStatus, ...updatedStatus });
    });

    it('should call the status handler', () => {
      player.setStatus({});
      expect(statusHandler).toHaveBeenCalledWith(player.status);
    });
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

  describe('getDuration', () => {
    it('returns a duration under a minute', () => {
      // @ts-ignore
      expect(player.getDuration(10)).toEqual({ seconds: 10, formatted: '0:10' });
    });

    it('returns a duration over a minute', () => {
      // @ts-ignore
      expect(player.getDuration(61)).toEqual({ seconds: 61, formatted: '1:01' });
    });

    it('returns a long duration', () => {
      // @ts-ignore
      expect(player.getDuration(4004)).toEqual({ seconds: 4004, formatted: '66:44' });
    });
  });

  describe('handlePlayerInfo', () => {
    it('should set the duration status', () => {
      expect(player.status.duration).toMatchObject({});

      // @ts-ignore
      player.handlePlayerInfo({ eventName: 'duration', value: 123 })

      expect(Object.keys(player.status.duration!)).toEqual(['seconds', 'formatted']);
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
