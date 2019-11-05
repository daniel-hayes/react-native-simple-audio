# react-native-simple-audio

## Getting started

`$ npm install react-native-simple-audio --save`

### Mostly automatic installation

`$ react-native link react-native-simple-audio`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-simple-audio` and add `SimpleAudio.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libSimpleAudio.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

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


## Usage
```javascript
import SimpleAudio from 'react-native-simple-audio';

// TODO: What to do with the module?
SimpleAudio;
```
