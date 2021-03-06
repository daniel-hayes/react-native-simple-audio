import { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';

export const recorderSetupError = 'There was a problem setting up the recorder';

const useAudioRecorder = (fileName: string) => {
  const [recorder, setRecorder] = useState({} as AudioRecorder);
  const [status, setStatus] = useState<PlayerStatus>({ loading: true });
  const [error, setError] = useState();

  useEffect(() => {
    async function createRecorder() {
      try {
        const nativeRecorder = new AudioRecorder(fileName, setStatus);

        // wait for player to be created before returning
        await nativeRecorder.prepare();

        if (nativeRecorder.status.ready) {
          setRecorder(nativeRecorder);
        }

        if (!nativeRecorder.status.ready) {
          setError(recorderSetupError);
        }
      } catch (err) {
        setError(recorderSetupError);
      }
    }

    if (!status.ready) {
      createRecorder();
    }
  }, [status]);

  const recorderController = {
    status,
    fileName: recorder.fileName,
    toggleRecording: recorder.toggleRecording
  };

  return [recorderController, error];
};

export default useAudioRecorder;
