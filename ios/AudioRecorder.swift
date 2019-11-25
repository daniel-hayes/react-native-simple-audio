//
//  AudioRecorder.swift
//  AudioRecorder
//
//

import AVFoundation

var audioRecorder: AVAudioRecorder!

@objc(AudioRecorder)
class AudioRecorder: NSObject, AVAudioRecorderDelegate {
    
    @objc(start)
    func start() -> Void {
        
        if audioRecorder == nil {
            // handle this scenario
        }

        let recordingSession = AVAudioSession.sharedInstance()

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
            finishRecording(success: false)
        }
        
        print("start")
    }

    func finishRecording(success: Bool) {
        if audioRecorder != nil {
            audioRecorder?.stop()
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
