# react-native-simple-audio

## Install
`yarn add react-native-simple-audio`

### iOS
`cd ios && pod install && cd .. # CocoaPods on iOS needs this extra step`

#### Run
`react-native run-ios`
or
1. `xed -b ios`
2. Run project in Xcode

### Android

COMING SOON

## Example usage
```javascript
import {
  ActivityIndicator,
  Button,
  View,
} from 'react-native';

import { useAudioPlayer } from 'react-native-simple-audio';

export const Player = ({ url }) => {
  const [player, error] = useAudioPlayer(url);

  if (error) {
		// handle error
    console.log(error);
  }

  return (
    <View>
      {player.status.isLoading && !player.status.isReady ? (
        <ActivityIndicator size="large" />
      ) : (
          <>
            <Button
              title={`${player.status.isPlaying ? 'Pause' : 'Play'}`}
              color="#f194ff"
              onPress={player.toggleAudio}
            />
            <Button
              title="Back 20 seconds"
              color="#f194ff"
              onPress={() => player.seekBackwards(20)}
            />
            <Button
              title="Forward 20 seconds"
              color="#f194ff"
              onPress={() => player.seekForwards(20)}
            />
          </>
        )}
    </View>
  )
};

............

<Player url="www.site.com/foo.mp3">
```


## TODO
- add ability to seek through audio
- add full example
- Add hook to record audio
- Add Android functionality
