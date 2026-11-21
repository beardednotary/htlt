// Renders App Store frames from the spec compose.cjs writes. Run through compose.cjs.
//
// Each frame: a headline and subline set large enough to read in search results, the
// full capture inside a phone that runs off the bottom of the frame, and optionally
// one section of that screen lifted out of the phone, wider than it, so the claim in
// the headline is readable at a glance.
//
// Output is an opaque RGB PNG at exactly the canvas size (no alpha channel), which is
// what App Store Connect asks for.

import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct Pop: Decodable {
  let name: String
  /// A different capture for the pop-out (a scrolled one, say); nil means the frame's own.
  let source: String?
  let y: Double
  let h: Double
}
struct Frame: Decodable {
  let out: String
  let source: String
  let headline: String
  let sub: String?
  let plan: String?
  let pop: Pop?
}
struct Spec: Decodable {
  let width: Int
  let height: Int
  let background: String
  let ink: String
  let subInk: String
  let planBackground: String
  let planInk: String
  let headlineMax: Double
  let subSize: Double
  let allHeadlines: [String]
  let frames: [Frame]
}

func color(_ hex: String) -> NSColor {
  var value: UInt64 = 0
  Scanner(string: String(hex.dropFirst(hex.hasPrefix("#") ? 1 : 0))).scanHexInt64(&value)
  return NSColor(
    srgbRed: CGFloat((value >> 16) & 0xFF) / 255, green: CGFloat((value >> 8) & 0xFF) / 255,
    blue: CGFloat(value & 0xFF) / 255, alpha: 1)
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

/// SF Pro Rounded: the system font, in the design the 1.0 listing's headlines used.
func roundedFont(_ size: CGFloat, _ weight: NSFont.Weight) -> NSFont {
  let base = NSFont.systemFont(ofSize: size, weight: weight)
  return NSFont(descriptor: base.fontDescriptor.withDesign(.rounded) ?? base.fontDescriptor, size: size) ?? base
}

func text(_ string: String, font: NSFont, color: NSColor, lineHeight: CGFloat, kern: CGFloat) -> NSAttributedString {
  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center
  paragraph.minimumLineHeight = lineHeight
  paragraph.maximumLineHeight = lineHeight
  paragraph.lineBreakMode = .byWordWrapping
  return NSAttributedString(
    string: string,
    attributes: [.font: font, .foregroundColor: color, .kern: kern, .paragraphStyle: paragraph])
}

/// Draws centred text from `top` within `width`; returns the bottom edge.
func draw(_ string: NSAttributedString, top: CGFloat, width: CGFloat, canvas: CGFloat) -> CGFloat {
  let bounds = string.boundingRect(
    with: NSSize(width: width, height: 10_000), options: [.usesLineFragmentOrigin, .usesFontLeading])
  let rect = NSRect(x: (canvas - width) / 2, y: top, width: width, height: ceil(bounds.height))
  string.draw(with: rect, options: [.usesLineFragmentOrigin, .usesFontLeading])
  return rect.maxY
}

/// Draws a CGImage into a top-left-origin rect of the flipped context, right way up.
func drawImage(_ image: CGImage, in rect: CGRect, _ ctx: CGContext) {
  ctx.saveGState()
  ctx.translateBy(x: rect.minX, y: rect.maxY)
  ctx.scaleBy(x: 1, y: -1)
  ctx.interpolationQuality = .high
  ctx.draw(image, in: CGRect(origin: .zero, size: rect.size))
  ctx.restoreGState()
}

func roundedRect(_ rect: CGRect, _ radius: CGFloat) -> CGPath {
  CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
}

let spec = try JSONDecoder().decode(
  Spec.self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
let W = CGFloat(spec.width)
let H = CGFloat(spec.height)
let textWidth = W - 110

// One headline size for the whole set: the largest that fits every line of every frame
// on one line, so no headline wraps on its own and the eight read as a series.
var headlineSize = CGFloat(spec.headlineMax)
let headlineLines = spec.allHeadlines.flatMap { $0.components(separatedBy: "\n") }
while headlineSize > 80 {
  let font = roundedFont(headlineSize, .bold)
  let widest = headlineLines.map {
    NSAttributedString(string: $0, attributes: [.font: font, .kern: -1.5]).size().width
  }.max() ?? 0
  if widest <= textWidth { break }
  headlineSize -= 2
}
print("headline \(Int(headlineSize)) pt, subline \(Int(spec.subSize)) pt")

for frame in spec.frames {
  guard
    let ctx = CGContext(
      data: nil, width: spec.width, height: spec.height, bitsPerComponent: 8, bytesPerRow: 0,
      space: CGColorSpace(name: CGColorSpace.sRGB)!,
      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
  else { fatalError("no context") }
  ctx.translateBy(x: 0, y: H)
  ctx.scaleBy(x: 1, y: -1)
  NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: true)

  ctx.setFillColor(color(spec.background).cgColor)
  ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))

  var y: CGFloat = 110

  if let plan = frame.plan {
    let label = text(
      plan.uppercased(), font: roundedFont(40, .heavy), color: color(spec.planInk), lineHeight: 48, kern: 3)
    let size = label.size()
    let pill = CGRect(x: (W - size.width - 64) / 2, y: y, width: size.width + 64, height: 76)
    ctx.addPath(roundedRect(pill, 38))
    ctx.setFillColor(color(spec.planBackground).cgColor)
    ctx.fillPath()
    label.draw(at: NSPoint(x: pill.minX + 32, y: pill.minY + 14))
    y = pill.maxY + 24
  }

  y = draw(
    text(frame.headline, font: roundedFont(headlineSize, .bold), color: color(spec.ink),
      lineHeight: headlineSize * 1.04, kern: -1.5),
    top: y, width: textWidth, canvas: W)

  if let sub = frame.sub {
    let subSize = CGFloat(spec.subSize)
    y = draw(
      text(sub, font: roundedFont(subSize, .semibold), color: color(spec.subInk),
        lineHeight: subSize * 1.18, kern: -0.3),
      top: y + 22, width: textWidth - 40, canvas: W)
  }

  // The phone: titanium body, black bezel, the capture as its screen, the island on top.
  let capture = loadImage(frame.source)
  let phoneW: CGFloat = 1000
  let bezel: CGFloat = 24
  let screenW = phoneW - bezel * 2
  let scale = screenW / CGFloat(capture.width)
  let screenH = CGFloat(capture.height) * scale
  let phone = CGRect(x: (W - phoneW) / 2, y: y + 70, width: phoneW, height: screenH + bezel * 2)
  let bodyRadius: CGFloat = 160
  let screenRadius: CGFloat = 140

  ctx.saveGState()
  ctx.setShadow(offset: CGSize(width: 0, height: 30), blur: 90, color: NSColor.black.withAlphaComponent(0.35).cgColor)
  ctx.addPath(roundedRect(phone, bodyRadius))
  ctx.setFillColor(color("#2C2C2E").cgColor)
  ctx.fillPath()
  ctx.restoreGState()
  ctx.addPath(roundedRect(phone.insetBy(dx: 3, dy: 3), bodyRadius - 3))
  ctx.setStrokeColor(color("#6E6E73").cgColor)
  ctx.setLineWidth(4)
  ctx.strokePath()
  ctx.addPath(roundedRect(phone.insetBy(dx: 10, dy: 10), bodyRadius - 10))
  ctx.setFillColor(NSColor.black.cgColor)
  ctx.fillPath()

  let screen = phone.insetBy(dx: bezel, dy: bezel)
  ctx.saveGState()
  ctx.addPath(roundedRect(screen, screenRadius))
  ctx.clip()
  drawImage(capture, in: screen, ctx)
  ctx.restoreGState()

  // Simulator captures leave the Dynamic Island out; draw it where it sits.
  let island = CGRect(x: W / 2 - 190 * scale, y: screen.minY + 33 * scale, width: 380 * scale, height: 112 * scale)
  ctx.addPath(roundedRect(island, island.height / 2))
  ctx.setFillColor(NSColor.black.cgColor)
  ctx.fillPath()

  if let pop = frame.pop {
    // The section, lifted out of the screen at its own place, wider than the phone. The
    // crop keeps a little of the grouped background around the rounded group.
    let from = pop.source.map(loadImage) ?? capture
    let inset: CGFloat = 30
    guard
      let piece = from.cropping(
        to: CGRect(x: inset, y: pop.y, width: CGFloat(from.width) - inset * 2, height: pop.h))
    else { fatalError("\(frame.out): pop-out \(pop.name) falls outside its capture") }
    let popW = W - 64
    let popH = CGFloat(piece.height) * popW / CGFloat(piece.width)
    // At its own place on the screen, but never off the bottom of the frame.
    let top = min(screen.minY + CGFloat(pop.y) * scale - 10, H - 90 - popH)
    let rect = CGRect(x: (W - popW) / 2, y: top, width: popW, height: popH)
    ctx.saveGState()
    ctx.setShadow(offset: CGSize(width: 0, height: 36), blur: 110, color: NSColor.black.withAlphaComponent(0.4).cgColor)
    ctx.addPath(roundedRect(rect, 56))
    ctx.setFillColor(NSColor.white.cgColor)
    ctx.fillPath()
    ctx.restoreGState()
    ctx.saveGState()
    ctx.addPath(roundedRect(rect, 56))
    ctx.clip()
    drawImage(piece, in: rect, ctx)
    ctx.restoreGState()
  }

  guard let image = ctx.makeImage(),
    let destination = CGImageDestinationCreateWithURL(
      URL(fileURLWithPath: frame.out) as CFURL, UTType.png.identifier as CFString, 1, nil)
  else { fatalError("cannot write \(frame.out)") }
  CGImageDestinationAddImage(
    destination, image, [kCGImagePropertyDPIWidth: 72, kCGImagePropertyDPIHeight: 72] as CFDictionary)
  CGImageDestinationFinalize(destination)
  print("wrote \(frame.out)")
}
