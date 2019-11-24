//
//  AudioRecorder.swift
//  AudioRecorder
//
//

import AVFoundation

var audioRecorder: AVAudioRecorder!
var recordingSession: AVAudioSession!

@objc(AudioRecorder)
class AudioRecorder: NSObject, AVAudioRecorderDelegate {
    
    @objc(start)
    func start() -> Void {
        do {
            try recordingSession.setCategory(.playAndRecord, mode: .default)
            try recordingSession.setActive(true)
//            recordingSession.requestRecordPermission() { [unowned self] allowed in
//                DispatchQueue.main.async {
//                    if allowed {
//                        self.loadRecordingUI()
//                    } else {
//                        // failed to record!
//                    }
//                }
//            }
        } catch {
            // failed to record!
        }
        
        
        let audioFilename = AudioUtils.getDocumentsDirectory().appendingPathComponent("recording.m4a")
        
        let settings = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 12000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        do {
            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder.delegate = self
            audioRecorder.record()
            
            print(self)
            print("recording")
        } catch {
//            finishRecording(success: false)
        }
        
        print("start")
    }

    func finishRecording(success: Bool) {
        audioRecorder.stop()
        audioRecorder = nil
        
        if success {
            
        } else {
            
            // recording failed :(
        }
    }
    
    @objc(stop)
    func stop() -> Void {
        print("start")
    }
    
    //  Delegate helpers
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        print("AVAudioRecorder finished recording")
        finishRecording(success: flag)
    }
    
    deinit {
        
    }
}
