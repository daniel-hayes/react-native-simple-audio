//
//  Utils.swift
//
//

import AVFoundation

class AudioUtils {
    static func getDocumentsDirectory() -> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0]
    }
    
    static func getFilePath(fileName: String) -> URL {
        let pathComponent = self.getDocumentsDirectory()
            .appendingPathComponent(fileName)
            .appendingPathExtension("m4a")

        return pathComponent
    }
    
    static func isRemoteUrl(path: String) -> Bool {
        return path.hasPrefix("http://") || path.hasPrefix("https://")
    }
    
    static func localFileExists(fileName: String) -> Bool {
        let path = self.getFilePath(fileName: fileName).path

        if FileManager.default.fileExists(atPath: path) {
            return true
        } else {
            return false
        }
    }
}
