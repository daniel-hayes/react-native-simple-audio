import { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

// @TODO make this a custom type for local/remote urls
const useAudioPlayer = (url: string) => {
  const [player, setPlayer] = useState({} as AudioPlayer);
  const [status, setStatus] = useState<PlayerStatus>({ isLoading: true });
  const [error, setError] = useState();

  useEffect(() => {
    async function createPlayer() {
      try {
        // status updates will happen in the Player event bus
        const nativePlayer = new AudioPlayer(url, setStatus);

        // wait for player to be created before returning
        await nativePlayer.create();

        if (nativePlayer.status.isReady) {
          setPlayer(nativePlayer);
        }

        // find a better way to handle this error
        if (!nativePlayer.status.isReady) {
          setError('Error');
        }
      } catch (err) {
        console.log(err);
        setError('Error');
      }
    }

    if (status.isLoading) {
      createPlayer();
    }
  }, [url, status]);

  // @TODO figure out when to call
  // player.destroy()

  const playerController = {
    status,
    toggleAudio: player.toggleAudio,
    seekForwards: player.seekForwards,
    seekBackwards: player.seekBackwards
  };

  return [playerController, error];
};

export default useAudioPlayer;