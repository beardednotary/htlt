// Prints the vertical extent of each card group in a capture, to set crops in frames.mjs.
//
//   xcrun swift scripts/screenshots/bands.swift screenshots/raw/today.png
//
// Samples one column inside the cards (x = 120 px by default) and reports runs of rows
// that differ from the grouped background colour (sampled at the left edge, half way
// down). A section header sits just above each run.

import CoreGraphics
import Foundation
import ImageIO

let path = CommandLine.arguments[1]
let column = CommandLine.arguments.count > 2 ? Int(CommandLine.arguments[2])! : 120

guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
  let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
else { fatalError("cannot read \(path)") }

let width = image.width
let height = image.height
var pixels = [UInt8](repeating: 0, count: width * height * 4)
let ctx = CGContext(
  data: &pixels, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4,
  space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

func rgb(_ x: Int, _ y: Int) -> (Int, Int, Int) {
  let i = (y * width + x) * 4
  return (Int(pixels[i]), Int(pixels[i + 1]), Int(pixels[i + 2]))
}

let background = rgb(8, height / 2)
func isBackground(_ p: (Int, Int, Int)) -> Bool {
  abs(p.0 - background.0) + abs(p.1 - background.1) + abs(p.2 - background.2) < 9
}

print("\(path): \(width)×\(height), background rgb\(background), column x=\(column)")
var start: Int? = nil
for y in 0..<height {
  let card = !isBackground(rgb(column, y))
  if card, start == nil { start = y }
  if !card, let s = start {
    if y - s > 40 { print("card  y: \(s)  h: \(y - s)  (ends \(y))") }
    start = nil
  }
}
if let s = start { print("card  y: \(s)  h: \(height - s)  (runs off the bottom)") }
