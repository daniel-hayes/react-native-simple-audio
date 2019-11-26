#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AudioPlayer, RCTEventEmitter)

RCT_EXTERN_METHOD(prepare:(NSString *)path)
RCT_EXTERN_METHOD(play)
RCT_EXTERN_METHOD(pause)
RCT_EXTERN_METHOD(destroy)
RCT_EXTERN_METHOD(seek:(NSInteger *)timeInSeconds)
RCT_EXTERN_METHOD(jump:(NSInteger *)timeInSeconds
                  shouldJumpBackwards:(BOOL *)backwards)

@end

@interface RCT_EXTERN_MODULE(AudioRecorder, NSObject)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(prepare:(NSString *)fileName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
