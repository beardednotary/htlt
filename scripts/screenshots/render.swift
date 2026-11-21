// Renders App Store frames from the spec compose.cjs writes. Run through compose.cjs.
//
// Output is an opaque RGB PNG at exactly the canvas size, which is what App Store
// Connect asks for (no alpha channel).

import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Crop: Decodable { let name: String; let x: Double; let y: Double; let w: Double; let h: Double }
struct Frame: Decodable {
  let out: String
  let source: String
  let headline: String
  let sub: String?
  let plan: String?
  let full: Bool
  let cards: [Crop]
}
struct Spec: Decodable {
  let width: Int
  let height: Int
  let captureWidth: Int
  let background: String
  let ink: String
  let subInk: String
  let planBackground: String
  let planInk: String
  let frames: [Frame]
}

func color(_ hex: String) -> NSColor {
  var value: UInt64 = 0
  Scanner(string: String(hex.dropFirst())).scanHexInt64(&value)
  return NSColor(
    srgbRed: CGFloat((value >> 16) & 0xFF) / 255,
    green: CGFloat((value >> 8) & 0xFF) / 255,
    blue: CGFloat(value & 0xFF) / 255,
    alpha: 1)
}

func loadImage(_ path: String) -> CGImage {
  guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
  else {
    FileHandle.standardError.write("cannot read \(path)\n".data(using: .utf8)!)
    exit(1)
  }
  return image
}

/// Draws a CGImage into a top-left-origin rect of a flipped context, right way up.
func draw(_ image: CGImage, in rect: CGRect, _ ctx: CGContext) {
  ctx.saveGState()
  ctx.translateBy(x: rect.minX, y: rect.maxY)
  ctx.scaleBy(x: 1, y: -1)
  ctx.interpolationQuality = .high
  ctx.draw(image, in: CGRect(origin: .zero, size: rect.size))
  ctx.restoreGState()
}

func attributed(_ text: String, size: CGFloat, weight: NSFont.Weight, color: NSColor, tracking: CGFloat, lineHeight: CGFloat) -> NSAttributedString {
  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center
  paragraph.minimumLineHeight = lineHeight
  paragraph.maximumLineHeight = lineHeight
  paragraph.lineBreakMode = .byWordWrapping
  return NSAttributedString(
    string: text,
    attributes: [
      .font: NSFont.systemFont(ofSize: size, weight: weight),
      .foregroundColor: color,
      .kern: tracking,
      .paragraphStyle: paragraph,
    ])
}

/// Draws text centred in a column starting at `top`; returns the bottom edge.
func drawText(_ text: NSAttributedString, top: CGFloat, width: CGFloat, canvasWidth: CGFloat) -> CGFloat {
  let bounds = text.boundingRect(
    with: NSSize(width: width, height: 10_000),
    options: [.usesLineFragmentOrigin, .usesFontLeading])
  let rect = NSRect(x: (canvasWidth - width) / 2, y: top, width: width, height: ceil(bounds.height))
  text.draw(with: rect, options: [.usesLineFragmentOrigin, .usesFontLeading])
  return rect.maxY
}

func roundedCard(_ image: CGImage, in rect: CGRect, radius: CGFloat, _ ctx: CGContext) {
  let path = CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
  ctx.saveGState()
  ctx.setShadow(offset: CGSize(width: 0, height: 22), blur: 60, color: NSColor.black.withAlphaComponent(0.28).cgColor)
  ctx.addPath(path)
  ctx.setFillColor(NSColor.white.cgColor)
  ctx.fillPath()
  ctx.restoreGState()

  ctx.saveGState()
  ctx.addPath(path)
  ctx.clip()
  draw(image, in: rect, ctx)
  ctx.restoreGState()
}

let specURL = URL(fileURLWithPath: CommandLine.arguments[1])
let spec = try JSONDecoder().decode(Spec.self, from: Data(contentsOf: specURL))
let W = CGFloat(spec.width)
let H = CGFloat(spec.height)
let margin: CGFloat = 64

for frame in spec.frames {
  guard
    let ctx = CGContext(
      data: nil, width: spec.width, height: spec.height, bitsPerComponent: 8, bytesPerRow: 0,
      space: CGColorSpace(name: CGColorSpace.sRGB)!,
      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
  else { fatalError("no context") }

  // Top-left origin for everything below.
  ctx.translateBy(x: 0, y: H)
  ctx.scaleBy(x: 1, y: -1)
  NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: true)

  ctx.setFillColor(color(spec.background).cgColor)
  ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))

  var y: CGFloat = 150

  if let plan = frame.plan {
    let label = attributed(plan.uppercased(), size: 34, weight: .semibold, color: color(spec.planInk), tracking: 3, lineHeight: 40)
    let size = label.size()
    let pill = CGRect(x: (W - size.width - 56) / 2, y: y - 12, width: size.width + 56, height: 64)
    ctx.setFillColor(color(spec.planBackground).cgColor)
    ctx.addPath(CGPath(roundedRect: pill, cornerWidth: 32, cornerHeight: 32, transform: nil))
    ctx.fillPath()
    label.draw(at: NSPoint(x: pill.minX + 28, y: pill.minY + 12))
    y = pill.maxY + 36
  } else {
    y += 40
  }

  let headline = attributed(frame.headline, size: 124, weight: .bold, color: color(spec.ink), tracking: -2.5, lineHeight: 132)
  y = drawText(headline, top: y, width: W - margin * 2, canvasWidth: W)

  if let sub = frame.sub {
    let line = attributed(sub, size: 50, weight: .medium, color: color(spec.subInk), tracking: -0.4, lineHeight: 62)
    y = drawText(line, top: y + 28, width: W - margin * 2 - 40, canvasWidth: W)
  }
  y += 80

  let capture = loadImage(frame.source)

  if frame.full {
    // One full screen, like a phone held up to the camera, running off the bottom.
    let width: CGFloat = W - 220
    let scale = width / CGFloat(capture.width)
    let rect = CGRect(x: (W - width) / 2, y: y, width: width, height: CGFloat(capture.height) * scale)
    roundedCard(capture, in: rect, radius: 160 * scale, ctx)
  } else {
    let crops = frame.cards.compactMap { c -> (CGImage, Crop)? in
      guard let piece = capture.cropping(to: CGRect(x: c.x, y: c.y, width: c.w, height: c.h)) else { return nil }
      return (piece, c)
    }
    let gap: CGFloat = 44
    var width = W - margin * 2
    var scale = width / CGFloat(spec.captureWidth)
    let available = H - y - 110
    let natural = crops.reduce(0) { $0 + CGFloat($1.1.h) * scale } + gap * CGFloat(max(crops.count - 1, 0))
    if natural > available {
      let shrink = (available - gap * CGFloat(max(crops.count - 1, 0))) / (natural - gap * CGFloat(max(crops.count - 1, 0)))
      scale *= shrink
      width *= shrink
    }
    for (piece, crop) in crops {
      let rect = CGRect(x: (W - CGFloat(crop.w) * scale) / 2, y: y, width: CGFloat(crop.w) * scale, height: CGFloat(crop.h) * scale)
      roundedCard(piece, in: rect, radius: 52, ctx)
      y = rect.maxY + gap
    }
  }

  guard let image = ctx.makeImage(),
    let destination = CGImageDestinationCreateWithURL(
      URL(fileURLWithPath: frame.out) as CFURL, UTType.png.identifier as CFString, 1, nil)
  else { fatalError("cannot write \(frame.out)") }
  CGImageDestinationAddImage(destination, image, [kCGImagePropertyDPIWidth: 72, kCGImagePropertyDPIHeight: 72] as CFDictionary)
  CGImageDestinationFinalize(destination)
  print("wrote \(frame.out)")
}
