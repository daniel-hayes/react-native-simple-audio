require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "SimpleAudio"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-simple-audio
                   DESC
  s.homepage     = package["repository"]["baseUrl"]
  s.license    = { :type => "Apache License, Version 2.0", :file => "LICENSE" }
  s.authors      = { "Daniel Hayes" => "dan.rdhayes@gmail.com" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => package["repository"]["url"], :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true
  s.swift_version = "5.0"

  s.dependency "React"
end

