import { renderHook } from '@testing-library/react-hooks';
import AudioPlayer from './AudioPlayer';
import useAudioPlayer from './useAudioPlayer';

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
        status: {
          isLoading: false,
          isReady: true,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    expect(result.current[0].status).toMatchObject({ isLoading: true });
    await waitForNextUpdate();
    expect(result.current[0].toggleAudio).toBeDefined();
    expect(result.current[0].seekForwards).toBeDefined();
    expect(result.current[0].seekBackwards).toBeDefined();
  });

  it('should return an error', async () => {
    // @ts-ignore
    AudioPlayer.mockImplementationOnce(() => {
      return {
        create: jest.fn(),
        status: {
          isLoading: false,
          isReady: false,
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAudioPlayer('foo.mp3')
    );

    expect(result.current[0].status).toMatchObject({ isLoading: true });
    await waitForNextUpdate();
    expect(result.current[1]).toMatch('Error');
  });

});
