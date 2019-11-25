import { NativeModules } from 'react-native';
import AudioRecorder from './AudioRecorder';

jest.mock('react-native', () => {
  return {
    NativeModules: {
      AudioRecorder: {
        start: jest.fn(),
      }
    }
  }
});

describe('AudioRecorder', () => {
  let recorder: AudioRecorder;

  beforeEach(() => {
    recorder = new AudioRecorder();
  });

  describe('toggle', () => {
    it('should start recording', () => {
      recorder.toggleRecording();
      expect(NativeModules.AudioRecorder.start).toHaveBeenCalled();
    });
  });
});
