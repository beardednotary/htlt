/// <reference types="node" />
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { adoptScenes } = require('../plugins/withSceneLifecycle.js') as {
  adoptScenes: (contents: string) => string;
};

/** The part of the Expo 57 template AppDelegate the plugin rewrites. */
const TEMPLATE = `internal import Expo
import React

@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    reactNativeDelegate = delegate
    reactNativeFactory = factory

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;

describe('withSceneLifecycle', () => {
  it('hands the window to the scene delegate', () => {
    const out = adoptScenes(TEMPLATE);
    assert.ok(out.includes('class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'));
    assert.ok(!out.includes('UIScreen.main.bounds'));
    assert.ok(!out.includes('startReactNative'));
    assert.ok(out.includes('reactNativeFactory = factory'), 'the factory is still created');
    assert.ok(out.includes('return super.application('));
  });

  it('is idempotent', () => {
    const once = adoptScenes(TEMPLATE);
    assert.equal(adoptScenes(once), once);
  });

  it('fails loudly when the template changes', () => {
    assert.throws(() => adoptScenes('class AppDelegate: SomethingElse {}'), /no longer matches/);
  });
});
