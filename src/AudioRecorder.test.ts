import { NativeModules } from 'react-native';
import AudioRecorder from './AudioRecorder';

jest.mock('react-native', () => {
  return {
    NativeModules: {
      AudioRecorder: {
        prepare: jest.fn(),
        start: jest.fn(),
        stop: jest.fn()
      }
    }
  }
});

jest.useFakeTimers();

describe('AudioRecorder', () => {
  let recorder: AudioRecorder;

  beforeAll(() => {
    console.error = jest.fn();
  });

  beforeEach(() => {
    recorder = new AudioRecorder('myfile', jest.fn());
  });

  describe('prepare', () => {
    it('prepares the recorder', async () => {
      NativeModules.AudioRecorder.prepare.mockReturnValueOnce(true);

      expect(recorder.status.ready).toBe(false);
      await recorder.prepare();
      expect(NativeModules.AudioRecorder.prepare).toHaveBeenCalledWith('myfile');
      expect(recorder.status.ready).toBe(true);
    });

    it('fails to prepare recorder', async () => {
      NativeModules.AudioRecorder.prepare.mockReturnValueOnce(false);

      expect(recorder.status.ready).toBe(false);
      await recorder.prepare();
      expect(NativeModules.AudioRecorder.prepare).toHaveBeenCalledWith('myfile');
      expect(recorder.status.ready).toBe(false);
    });

    it('handles errors', async () => {
      NativeModules
        .AudioRecorder
        .prepare
        .mockRejectedValueOnce(new Error('error'));


      expect(recorder.status.ready).toBe(false);
      await recorder.prepare();
      expect(NativeModules.AudioRecorder.prepare).toHaveBeenCalledWith('myfile');
      expect(console.error).toHaveBeenCalled();
      expect(recorder.status.ready).toBe(false);
    });
  });

  describe('toggleRecording', () => {
    it('should toggle recording', () => {
      recorder.toggleRecording();
      expect(NativeModules.AudioRecorder.start).toHaveBeenCalledTimes(1);
      expect(recorder.status).toMatchObject({ recording: true, finished: false });
      recorder.toggleRecording();
      expect(NativeModules.AudioRecorder.stop).toHaveBeenCalledTimes(1);
      expect(recorder.status).toMatchObject({ recording: false, finished: true });
    });
  });

  describe('startTimer', () => {
    it('should begin recording counter', () => {
      // allow access to private method
      // @ts-ignore
      recorder.startTimer();

      // interval runs for 1 second
      jest.runOnlyPendingTimers();

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(recorder.status.currentTime).toMatchObject({
        seconds: 1
      });
    });
  });

  describe('clearTimer', () => {
    it('should begin recording counter', () => {
      // allow access to private method
      // @ts-ignore
      recorder.clearTimer();

      expect(clearInterval).toHaveBeenCalled();
      expect(recorder.status.currentTime).toMatchObject({
        seconds: 0
      });
    });
  });
});
