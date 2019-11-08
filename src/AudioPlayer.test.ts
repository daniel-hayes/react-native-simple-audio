import { NativeModules } from 'react-native';
import AudioPlayer from './AudioPlayer';

jest.mock('react-native', () => {
  const { NativeEventEmitter } = require.requireActual('react-native');

  return {
    NativeEventEmitter,
    NativeModules: {
      // @TODO how to include NativePlayer type here
      AudioPlayer: {
        play: jest.fn(),
        pause: jest.fn(),
        prepare: jest.fn(),
        jump: jest.fn(),
        addListener: jest.fn()
      }
    }
  }
})

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
});
