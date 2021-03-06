import { renderHook } from '@testing-library/react-hooks';
import AudioPlayer from './AudioPlayer';
import useAudioPlayer, { playerSetupError } from './useAudioPlayer';

jest.mock('./AudioPlayer');

describe('useAudioPlayer', () => {
  beforeAll(() => {
    // @ts-ignore
    // ts complains `mockImplementation` doesn't exist
    AudioPlayer.mockImplementation(() => {
      return {
        create: jest.fn(),
        status: {}
      }
    });
  });

  it('should successfully return a player', async () => {
    // @ts-ignore
    AudioPlayer.mockImplementationOnce(() => {
      return {
        create: jest.fn(),
        toggleAudio: jest.fn(),
        seekForwards: jest.fn(),
        seekBackwards: jest.fn(),
        seek: jest.fn(),
        status: {
          loading: false,
          ready: true,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[0].toggleAudio).toBeDefined();
    expect(result.current[0].seekForwards).toBeDefined();
    expect(result.current[0].seekBackwards).toBeDefined();
    expect(result.current[0].seek).toBeDefined();
  });

  it('should return an error', async () => {
    // @ts-ignore
    AudioPlayer.mockImplementationOnce(() => {
      return {
        create: jest.fn(),
        status: {
          loading: false,
          ready: false,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[1]).toMatch(playerSetupError);
  });

  it('should throw an error', async () => {
    // @ts-ignore
    AudioPlayer.mockImplementationOnce(() => {
      return {
        create: jest.fn().mockRejectedValue(new Error('error')),
        status: {}
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    expect(result.current[0].status).toMatchObject({ loading: true });
    await waitForNextUpdate();
    expect(result.current[1]).toMatch(playerSetupError);
  });

  it('should cleanup after unmounting', async () => {
    // @ts-ignore
    AudioPlayer.mockImplementationOnce(() => {
      return {
        create: jest.fn(),
        destroy: jest.fn(),
        status: {
          loading: false,
          ready: true,
        }
      }
    });

    const { result, waitForNextUpdate, unmount } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    await waitForNextUpdate();

    // test cleanup method
    unmount();

    expect(result.current[0].destroy).toHaveBeenCalled();
  });
});
