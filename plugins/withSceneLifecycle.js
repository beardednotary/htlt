/**
 * Adopts the UIScene life cycle, which the iOS 27 SDK requires: an app built with it
 * that still uses the app-delegate window traps at launch
 * (`_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`), before any of our
 * code runs.
 *
 * Expo 57.0.33 ships the scene delegate (`EXExpoAppSceneDelegate`), but neither the
 * template nor prebuild wires it in yet. This plugin does:
 *
 * - Info.plist: one window scene, delegated to `EXExpoAppSceneDelegate`.
 * - AppDelegate: conforms to `ExpoReactNativeFactoryProvider` and no longer makes its
 *   own window. The scene delegate creates the window from the connecting scene and
 *   starts React Native into it, using the factory the app delegate still creates.
 *
 * Remove this once the Expo template adopts scenes itself; prebuild will then fail
 * loudly here rather than patch twice, because the strings below no longer match.
 */
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
      },
    ],
  },
};

const CLASS_LINE = 'class AppDelegate: ExpoAppDelegate {';
const CLASS_LINE_ADOPTED = 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {';

// The template starts React Native into a window it makes itself.
const WINDOW_BLOCK = /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;
const WINDOW_BLOCK_ADOPTED = `
    // The scene delegate (EXExpoAppSceneDelegate) makes the window and starts React
    // Native into it; see plugins/withSceneLifecycle.js.
`;

function adoptScenes(contents) {
  if (contents.includes(CLASS_LINE_ADOPTED)) return contents;
  if (!contents.includes(CLASS_LINE) || !WINDOW_BLOCK.test(contents)) {
    throw new Error(
      'withSceneLifecycle: AppDelegate.swift no longer matches the Expo 57 template. ' +
        'If the template now adopts the scene life cycle, remove this plugin.'
    );
  }
  return contents.replace(CLASS_LINE, CLASS_LINE_ADOPTED).replace(WINDOW_BLOCK, WINDOW_BLOCK_ADOPTED);
}

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return mod;
  });
  config = withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: expected a Swift AppDelegate');
    }
    mod.modResults.contents = adoptScenes(mod.modResults.contents);
    return mod;
  });
  return config;
};

module.exports.adoptScenes = adoptScenes;
