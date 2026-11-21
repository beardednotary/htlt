import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useLayoutEffect, useRef } from 'react';

import { accent } from './theme';

/**
 * Cancel on the left, the confirming action on the right — the bar every form
 * sheet in the app uses.
 *
 * Built from Stack.Toolbar, which produces real UIBarButtonItems rather than
 * custom views inside UIKit's shared glass background (that background is what
 * flashed white through transitions). Every item hides the shared background;
 * see "Navigation bar buttons" in AGENTS.md before changing that.
 *
 * Stack.Toolbar re-applies the screen's header options whenever its children
 * change. A form re-renders on every keystroke and its save function is a new
 * closure each time, so the latest one is kept in a ref: the bar itself is only
 * rebuilt when the label or the disabled state actually changes.
 */
export function SheetToolbar({
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
}: {
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}) {
  const latest = useRef(onConfirm);
  useLayoutEffect(() => {
    latest.current = onConfirm;
  });
  const confirm = useCallback(() => latest.current(), []);

  return (
    <SheetToolbarItems
      confirmLabel={confirmLabel}
      onConfirm={confirm}
      confirmDisabled={confirmDisabled}
    />
  );
}

/** The confirming action reads as primary by weight, as bar buttons did before iOS 26. */
export const confirmStyle = { fontWeight: '600' } as const;

const SheetToolbarItems = memo(function SheetToolbarItems({
  confirmLabel,
  onConfirm,
  confirmDisabled,
}: {
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled: boolean;
}) {
  const router = useRouter();
  return (
    <>
      <Stack.Toolbar placement="left" tintColor={accent}>
        <Stack.Toolbar.Button hidesSharedBackground onPress={() => router.back()}>
          Cancel
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right" tintColor={accent}>
        {/* Plain and semibold, not variant="done": on iOS 26+ "done" is a filled
            capsule with white text, and hidesSharedBackground removes the capsule,
            leaving white text on a white bar. */}
        <Stack.Toolbar.Button
          hidesSharedBackground
          style={confirmStyle}
          disabled={confirmDisabled}
          onPress={onConfirm}>
          {confirmLabel}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
});
