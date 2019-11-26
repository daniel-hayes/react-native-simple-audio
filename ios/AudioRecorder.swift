//
//  AudioRecorder.swift
//  AudioRecorder
//
//

import AVFoundation

var audioRecorder: AVAudioRecorder!

@objc(AudioRecorder)
class AudioRecorder: NSObject, AVAudioRecorderDelegate {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc(prepare:resolver:rejecter:)
    func prepare(fileName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        

        print(fileName)

//        RCT_REMAP_METHOD(findEvents,
//                         findEventsWithResolver:(RCTPromiseResolveBlock)resolve
//            rejecter:(RCTPromiseRejectBlock)reject)
//        {
//            NSArray *events = ...
//            if (events) {
//                resolve(events);
//            } else {
//                NSError *error = ...
//                    reject(@"no_events", @"There were no events", error);
//            }
//        }
        
        let recordingSession = AVAudioSession.sharedInstance()
        
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default)
            try recordingSession.setActive(true)
            
            // @TODO request permission
            //            recordingSession.requestRecordPermission() { [unowned self] allowed in
            //                DispatchQueue.main.async {
            //                    if allowed {
            //                        self.loadRecordingUI()
            //                    } else {
            //                        // failed to record!
            //                    }
            //                }
            //            }
            
            let audioFilename = AudioUtils.getDocumentsDirectory().appendingPathComponent("recording.m4a")
        
            let settings = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 12000,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder.delegate = self
            
            resolve(true)
        } catch {
            finishRecording(success: false)
            reject("recorder_setup_failure", "Could not setup audio recorder", nil)
        }
        
    }
    
    @objc(start)
    func start() -> Void {
        if audioRecorder != nil {
            audioRecorder.record()
        }
    }

    func finishRecording(success: Bool) {
        if audioRecorder != nil {
            audioRecorder.stop()
            audioRecorder = nil
        }

        try! AVAudioSession.sharedInstance().setActive(false)
        
        if success {
            
        } else {
            // recording failed :(
        }
    }
    
    @objc(stop)
    func stop() -> Void {
        finishRecording(success: true)
    }
    
    //  Delegate helpers
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        print("AVAudioRecorder finished recording")
        finishRecording(success: flag)
    }
    
    deinit {
        
    }
}
