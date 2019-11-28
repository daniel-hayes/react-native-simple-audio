import { renderHook } from '@testing-library/react-hooks';
import AudioRecorder from './AudioRecorder';
import useAudioRecorder, { recorderSetupError } from './useAudioRecorder';

jest.mock('./AudioRecorder');

describe('useAudioRecorder', () => {
  it('should successfully return a recorder', async () => {
    // @ts-ignore
    AudioRecorder.mockImplementationOnce(() => {
      return {
        prepare: jest.fn(),
        toggleRecording: jest.fn(),
        fileName: 'foo',
        status: {
          loading: false,
          ready: true,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioRecorder('test-file')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[0].toggleRecording).toBeDefined();
    expect(result.current[0].fileName).toBeDefined();
  });

  it('should return an error', async () => {
    // @ts-ignore
    AudioRecorder.mockImplementationOnce(() => {
      return {
        prepare: jest.fn(),
        status: {
          loading: false,
          ready: false,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioRecorder('test-file')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[1]).toMatch(recorderSetupError);
  });

  it('should throw an error', async () => {
    // @ts-ignore
    AudioRecorder.mockImplementationOnce(() => {
      return {
        prepare: jest.fn().mockRejectedValue(new Error('error')),
        status: {}
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioRecorder('test-file')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[1]).toMatch(recorderSetupError);
  });
});
