# react-native-simple-audio

## Install
`yarn add react-native-simple-audio`

### iOS
`cd ios && pod install && cd .. # CocoaPods on iOS needs this extra step`

#### Run
`react-native run-ios`

or build manually:

1. `xed -b ios`
2. Run project in Xcode

#### NOTE ABOUT iOS USAGE
Currently, there are two other changes that need to take place before the app will properly build.
1. This package has a minimum requirement of iOS 10.0. So if you are building an application for anything lower than 10.0, you need to go into `<YOUR PROJECT>/ios/Podfile` and change the first line to `platform :ios, '10.0'`.
2. There's a strange build issue that seems to sometimes occur with Swift based custom modules: https://stackoverflow.com/questions/52536380/why-linker-link-static-libraries-with-errors-ios/54586937#54586937 Following these steps fixes the issue. I will work on either automating this or hopefully a future version of RN will eliminate the need.

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

// Player component usage
<Player url="www.site.com/foo.mp3">
```


## TODO
- Add ability to seek through audio
- Add full example
- Add hook to record audio
- Add Android functionality
