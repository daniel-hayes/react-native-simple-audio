import Audio from './Audio';

describe('Audio', () => {
  const statusHandler = jest.fn();
  let actual: Audio;

  beforeEach(() => {
    actual = new Audio(statusHandler);
    statusHandler.mockReset();
  });

  describe('setStatus', () => {
    it('should update local status', () => {
      const initialStatus = actual.status;
      const updatedStatus = { ready: true }
      actual.setStatus(updatedStatus);
      expect(actual.status).not.toEqual(initialStatus);
      expect(actual.status).toEqual({ ...initialStatus, ...updatedStatus });
    });

    it('should call the status handler', () => {
      actual.setStatus({});
      expect(statusHandler).toHaveBeenCalledWith(actual.status);
    });
  });

  describe('formatTime', () => {
    it('returns a duration under a minute', () => {
      // @ts-ignore
      expect(actual.formatTime(10)).toEqual({ seconds: 10, formatted: '0:10' });
    });

    it('returns a duration over a minute', () => {
      // @ts-ignore
      expect(actual.formatTime(61)).toEqual({ seconds: 61, formatted: '1:01' });
    });

    it('returns a long duration', () => {
      // @ts-ignore
      expect(actual.formatTime(4004)).toEqual({ seconds: 4004, formatted: '66:44' });
    });
  });
});
