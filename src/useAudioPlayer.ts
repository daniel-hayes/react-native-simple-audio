import { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

export const playerSetupError = 'There was a problem setting up the player';

// @TODO make this a custom type for local/remote urls
const useAudioPlayer = (url: string) => {
  const [player, setPlayer] = useState({} as AudioPlayer);
  const [status, setStatus] = useState<PlayerStatus>({ loading: true });
  const [error, setError] = useState();

  useEffect(() => {
    async function createPlayer() {
      try {
        // status updates will happen in the Player event bus
        const nativePlayer = new AudioPlayer(url, setStatus);

        // wait for player to be created before returning
        await nativePlayer.create();

        if (nativePlayer.status.ready) {
          setPlayer(nativePlayer);
        }

        // find a better way to handle this error
        if (!nativePlayer.status.ready) {
          setError(playerSetupError);
        }
      } catch (err) {
        setError(playerSetupError);
      }
    }

    if (status.loading) {
      createPlayer();
    }
  }, [url, status]);

  // call on unmount
  useEffect(() => (
    () => {
      if (player.destroy) {
        // remove all listeners
        player.destroy();
      }
    }
  ), [player]);

  const playerController = {
    status,
    toggleAudio: player.toggleAudio,
    seekForwards: player.seekForwards,
    seekBackwards: player.seekBackwards,
    destroy: player.destroy
  };

  return [playerController, error];
};

export default useAudioPlayer;
