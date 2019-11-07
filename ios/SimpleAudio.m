#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AudioPlayer, NSObject)

RCT_EXTERN_METHOD(prepare:(NSString *)path)
RCT_EXTERN_METHOD(play)
RCT_EXTERN_METHOD(pause)
RCT_EXTERN_METHOD(jump:(NSInteger *)timeInSeconds shouldJumpBackwards:(BOOL *)backwards)

@end
