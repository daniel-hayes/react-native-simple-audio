# react-native-simple-audio

## Install
`yarn add react-native-simple-audio`

### iOS
`cd ios && pod install && cd .. # CocoaPods on iOS needs this extra step`

## Run
`yarn react-native run-ios`

### Manual installation

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.reactlibrary.SimpleAudioPackage;` to the imports at the top of the file
  - Add `new SimpleAudioPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-simple-audio'
  	project(':react-native-simple-audio').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-simple-audio/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-simple-audio')
  	```


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

...

<Player url="www.site.com/foo.mp3">
```
