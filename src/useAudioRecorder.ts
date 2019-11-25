import { useState } from 'react';
import AudioRecorder from './AudioRecorder';

const useAudioRecorder = () => {
  const [recorder, setRecorder] = useState({} as AudioRecorder);

  setRecorder(new AudioRecorder());

  return {
    recorder
  }
};

export default useAudioRecorder;
