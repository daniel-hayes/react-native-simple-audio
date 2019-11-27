//
//  AudioRecorder.swift
//  AudioRecorder
//
//

import AVFoundation

var audioRecorder: AVAudioRecorder!

@objc(AudioRecorder)
class AudioRecorder: NSObject {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // @TODO there's no error handling when record fails. only happy paths
    
    @objc(prepare:resolver:rejecter:)
    func prepare(fileName: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let recordingSession = AVAudioSession.sharedInstance()
        
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default)
            try recordingSession.setActive(true)
            let url = AudioUtils.getFilePath(fileName: fileName)

            let settings = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 12000,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            resolve(true)
        } catch {
            reject("recorder_setup_failure", "Could not setup audio recorder", nil)
        }
        
    }
    
    @objc(start)
    func start() -> Void {
        audioRecorder.record()
    }
    
    @objc(stop)
    func stop() -> Void {
        audioRecorder.stop()
    }

    deinit {
        if audioRecorder != nil {
            audioRecorder.stop()
            audioRecorder = nil
        }
        
        try! AVAudioSession.sharedInstance().setActive(false)
    }
}
