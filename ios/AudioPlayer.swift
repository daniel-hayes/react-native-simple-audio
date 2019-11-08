//
//  AudioPlayer.swift
//  AudioPlayer
//
//  Created by Daniel Hayes on 10/20/19.
//

import AVFoundation

var player: AVPlayer!
var playerItem: AVPlayerItem!
var asset: AVAsset!
var statusObserver: NSKeyValueObservation!
var emptyBufferObserver: NSKeyValueObservation!
var playbackLikelyObserver: NSKeyValueObservation!
var timeControlStatusObserver: NSKeyValueObservation!
var waitingObserver: NSKeyValueObservation!

// Key-value observing context
private var observerContext = 0


@objc(AudioPlayer)
class AudioPlayer: RCTEventEmitter {
    
    enum SupportedEvents {
        static let initialize = "initialize"
        static let playerStatus = "playerStatus"
    }
    
    enum PlayerStatus {
        static let failed = -1
        static let unknown = 0
        static let ready = 1
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc open override func supportedEvents() -> [String] {
        return [SupportedEvents.initialize, SupportedEvents.playerStatus]
    }
    
    @objc(prepare:)
    func prepare(path: String) -> Void {
        guard let url = URL(string: path) else {
            
            // @TODO handle error
            print("Invalid URL")
            return
        }
        
        // Create asset to be played
        //    asset = AVAsset(url: url)
        asset = AVAsset(url: url)
        
        // Create a new AVPlayerItem with the asset and an
        // array of asset keys to be automatically loaded
        playerItem = AVPlayerItem(asset: asset,
                                  automaticallyLoadedAssetKeys: ["playable", "hasProtectedContent"])
        
        // Associate the player item with the player
        player = AVPlayer(playerItem: playerItem)
        // ensure playback happens immediately
        player.automaticallyWaitsToMinimizeStalling = false
        
        self.addObservers()
    }
    
    @objc(play)
    func play() -> Void {
        player.play()
    }
    
    @objc(pause)
    func pause() -> Void {
        player.pause()
    }
    
    @objc(jump:shouldJumpBackwards:)
    func jump(timeInSeconds: Int, shouldJumpBackwards backwards: Bool) -> Void {
        let seconds: Int64 = Int64(timeInSeconds)
        let jumpTo: CMTime = CMTimeMake(value: seconds, timescale: 1)
        let newTime = backwards ? player.currentTime() - jumpTo : player.currentTime() + jumpTo
        
        player.seek(to: newTime, toleranceBefore: CMTime.zero, toleranceAfter: CMTime.zero)
    }
    
    private func addObservers() {
        statusObserver = playerItem.observe(\.status, options:  [.new, .old], changeHandler: { (playerItem, change) in
            switch playerItem.status {
            case .readyToPlay:
                self.sendEvent(withName: SupportedEvents.initialize, body: PlayerStatus.ready)
                print("ready to play")
            case .failed:
                self.sendEvent(withName: SupportedEvents.initialize, body: PlayerStatus.failed)
                // @TODO put better error handling here
                print("player failed to load")
                return
            case .unknown:
                self.sendEvent(withName: SupportedEvents.initialize, body: PlayerStatus.unknown)
                print("unknown player status")
            default:
                print("waiting for status change")
            }
        })
        
        // listening for buffer changes
        emptyBufferObserver = player.currentItem!.observe(\.isPlaybackBufferEmpty, options: [.new]) { (playerItem, change) in
            print("buffering...")
            self.sendEvent(withName: SupportedEvents.playerStatus, body: "BUFFERING")
        }
        
        playbackLikelyObserver = player.currentItem!.observe(\.isPlaybackLikelyToKeepUp, options: [.new]) { (playerItem, change) in
            print("buffering ends...")
            
            if playerItem.isPlaybackLikelyToKeepUp {
                print("DONE")
                self.sendEvent(withName: SupportedEvents.playerStatus, body: "PLAYER DONE")
            }
        }
        
        timeControlStatusObserver = player.observe(\.timeControlStatus, options: [.new, .old], changeHandler: { (playerItem, change) in
            switch (playerItem.timeControlStatus) {
            case AVPlayerTimeControlStatus.paused:
                print("Media Paused")
                self.sendEvent(withName: SupportedEvents.playerStatus, body: "PLAYER PAUSED")
                
            case AVPlayerTimeControlStatus.playing:
                print("Media Playing")
                self.sendEvent(withName: SupportedEvents.playerStatus, body: "PLAYER PLAYING")
                
            case AVPlayerTimeControlStatus.waitingToPlayAtSpecifiedRate:
                print("Media Waiting to play at specific rate!")
                self.sendEvent(withName: SupportedEvents.playerStatus, body: "PLAYER WAITING")
                
            default:
                print("no changes")
            }
        })
        
        waitingObserver = player.observe(\.reasonForWaitingToPlay, options: [.new, .old], changeHandler: { (playerItem, change) in
            print("REASON FOR WAITING TO PLAY: ", playerItem.reasonForWaitingToPlay?.rawValue as Any)
        })
        //    @TODO what happens when audio is done playing?
    }
    
    private func removeObservers() {
        //    statusObserver?.invalidate()
        //    emptyBufferObserver?.invalidate()
        //    playbackLikelyObserver?.invalidate()
        //    timeControlStatusObserver?.invalidate()
        //    waitingObserver?.invalidate()
    }
    
    deinit {
        self.removeObservers()
    }
}
