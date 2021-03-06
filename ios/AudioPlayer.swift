//
//  AudioPlayer.swift
//  AudioPlayer
//
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
var loadedTimeRangesObserver: NSKeyValueObservation!
var timeObserverToken: Any?

// Key-value observing context
private var observerContext = 0


@objc(AudioPlayer)
class AudioPlayer: RCTEventEmitter {
    
    enum SupportedEvents {
        static let playerStatus = "playerStatus"
        static let playerItemStatus = "playerItemStatus"
        static let playerInfo = "playerInfo"
    }
    
    enum PlayerStatus {
        static let failed = -1
        static let unknown = 0
        static let ready = 1
    }
    
    enum PlayerItemStatus {
        static let buffering = 0
        static let buffered = 1
        static let playing = 2
        static let paused = 3
        static let waiting = 4
    }
    
    enum PlayerInfo {
        static let currentTime = "currentTime"
        static let duration = "duration"
        static let loadedTime = "loadedTime"
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc open override func supportedEvents() -> [String] {
        return [
            SupportedEvents.playerStatus,
            SupportedEvents.playerItemStatus,
            SupportedEvents.playerInfo
        ]
    }
    
    @objc(prepare:)
    func prepare(path: String) -> String? {

        if AudioUtils.isRemoteUrl(path: path) {
            guard let url = URL(string: path) else {
                // handle error
                return "Not a valid url path"
            }

            asset = AVAsset(url: url)
        } else if AudioUtils.localFileExists(fileName: path) {
            let localUrl = AudioUtils.getFilePath(fileName: path)
            asset = AVAsset(url: localUrl)
        } else {
            return "Nothing to play"
        }
        
        // Create a new AVPlayerItem with the asset and an
        // array of asset keys to be automatically loaded
        playerItem = AVPlayerItem(asset: asset,
                                  automaticallyLoadedAssetKeys: ["playable", "hasProtectedContent"])
        
        // Associate the player item with the player
        player = AVPlayer(playerItem: playerItem)
        
        // ensure playback happens immediately
        player.automaticallyWaitsToMinimizeStalling = false
        
        self.addObservers()
        
        return nil
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
    
    @objc(seek:)
    func seek(timeInSeconds: Int) -> Void {
        let seconds: Int64 = Int64(timeInSeconds)
        let jumpTo: CMTime = CMTimeMake(value: seconds, timescale: 1)
        player.seek(to: jumpTo)
    }
    
    private func sendEventObject(listener: String, eventBody: (name: String, value: Any)) -> Void {
        let body: [String: Any] = [
            "eventName": eventBody.name,
            "value": eventBody.value,
        ]

        self.sendEvent(withName: listener, body: body)
    }
    
    private func addObservers() {
        statusObserver = playerItem.observe(\.status, options:  [.new, .old], changeHandler: { (playerItem, change) in
            switch playerItem.status {
            case .readyToPlay:
                // send ready event and other initial item info
                self.sendEvent(withName: SupportedEvents.playerStatus, body: PlayerStatus.ready)
                
                // duration of the current item
                let durationInSeconds = round(CMTimeGetSeconds(playerItem.asset.duration))
                self.sendEventObject(
                    listener: SupportedEvents.playerInfo,
                    eventBody: (PlayerInfo.duration, durationInSeconds)
                )
            case .failed:
                self.sendEvent(withName: SupportedEvents.playerStatus, body: PlayerStatus.failed)
            case .unknown:
                self.sendEvent(withName: SupportedEvents.playerStatus, body: PlayerStatus.unknown)
            default:
                print("waiting for status change")
            }
        })
        
        // listening for buffer changes
        emptyBufferObserver = player.currentItem!.observe(\.isPlaybackBufferEmpty, options: [.new]) { (playerItem, change) in
            self.sendEvent(withName: SupportedEvents.playerItemStatus, body: PlayerItemStatus.buffering)
        }
        
        playbackLikelyObserver = player.currentItem!.observe(\.isPlaybackLikelyToKeepUp, options: [.new]) { (playerItem, change) in
            if playerItem.isPlaybackLikelyToKeepUp {
                self.sendEvent(withName: SupportedEvents.playerItemStatus, body: PlayerItemStatus.buffered)
            }
        }
        
        timeControlStatusObserver = player.observe(\.timeControlStatus, options: [.new, .old], changeHandler: { (player, change) in
            switch (player.timeControlStatus) {
            case AVPlayer.TimeControlStatus.paused:
                self.sendEvent(withName: SupportedEvents.playerItemStatus, body: PlayerItemStatus.paused)
            case AVPlayer.TimeControlStatus.playing:
                self.sendEvent(withName: SupportedEvents.playerItemStatus, body: PlayerItemStatus.playing)
            case AVPlayer.TimeControlStatus.waitingToPlayAtSpecifiedRate:
                self.sendEvent(withName: SupportedEvents.playerItemStatus, body: PlayerItemStatus.waiting)
            default:
                print("no changes")
            }
        })

        // Notify every half second
        let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        timeObserverToken = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { time in
            let seconds = Int(round(CMTimeGetSeconds(time)))
            self.sendEventObject(
                listener: SupportedEvents.playerInfo,
                eventBody: (PlayerInfo.currentTime, seconds)
            )
        }
        
        loadedTimeRangesObserver = playerItem.observe(\.loadedTimeRanges, options:  [.new, .old], changeHandler: { (playerItem, change) in
            let loadedTimeRanges = playerItem.loadedTimeRanges
            let first = loadedTimeRanges.first

            if let timeRange = first?.timeRangeValue {
                let startSeconds = CMTimeGetSeconds(timeRange.start)
                let durationSecound = CMTimeGetSeconds(timeRange.duration)
                let secondsLoaded = startSeconds + durationSecound
                
                self.sendEventObject(
                    listener: SupportedEvents.playerInfo,
                    eventBody: (PlayerInfo.loadedTime, secondsLoaded)
                )
            }
        })
    }
    
    @objc(destroy)
    func destroy() -> Void {
        player.pause()
        player.replaceCurrentItem(with: nil)
        // do we need this?
        // self.removeObservers();
    }
    
    private func removeObservers() {
        statusObserver?.invalidate()
        emptyBufferObserver?.invalidate()
        playbackLikelyObserver?.invalidate()
        timeControlStatusObserver?.invalidate()
        waitingObserver?.invalidate()
        loadedTimeRangesObserver?.invalidate()
        
        if let timeObserverToken = timeObserverToken {
            player.removeTimeObserver(timeObserverToken)
        }
    }
    
    deinit {
        self.removeObservers()
    }
}
