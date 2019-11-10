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
        addListener: jest.fn()
      }
    }
  }
});

describe('AudioPlayer', () => {
  const statusHandler = jest.fn();
  let player: AudioPlayer;

  beforeEach(() => {
    player = new AudioPlayer('foo.mp3', statusHandler);
    statusHandler.mockReset();
  });

  describe('setStatus', () => {
    it('should update local status', () => {
      const initialStatus = player.status;
      const updatedStatus = { isReady: true }
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
      player.setStatus({ isPlaying: true });
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
    let player: AudioPlayer;
    let NativeEventEmitterMock = new NativeEventEmitter(NativeModules.AudioPlayer);

    beforeEach(() => {
      player = new AudioPlayer('foo.mp3', jest.fn(), NativeEventEmitterMock);
    });

    it('successfully creates a player', async () => {
      const result = await new Promise((resolve) => {
        // can't do this async/await because this should be non-blocking
        // this needs to emit an event in the same test
        player.create()
          .then(() => {
            resolve(player.status);
          });

        NativeEventEmitterMock.emit('initialize', 1);
      });

      expect(result).toMatchObject({
        isReady: true,
        isPlaying: false,
        isLoading: false
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

        NativeEventEmitterMock.emit('initialize', -1);
      });

      // @TODO figure out a better way to error handle this in implementation
      expect(result).toMatchObject({
        isReady: false,
        isPlaying: false,
        isLoading: false
      });
    });
  });
});
