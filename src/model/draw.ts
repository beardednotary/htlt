import type { DrawStatus } from './types';

export const DRAW_STATUS_ORDER: DrawStatus[] = [
  'planning',
  'applied',
  'drawn',
  'notDrawn',
  'purchased',
  'complete',
];

export const DRAW_STATUS_LABELS: Record<DrawStatus, string> = {
  planning: 'Planning',
  applied: 'Applied',
  drawn: 'Drawn',
  notDrawn: 'Not Drawn',
  purchased: 'Tag Purchased',
  complete: 'Complete',
};

/** The line under the status — what it means, not what it is called. */
export const DRAW_STATUS_DETAIL: Record<DrawStatus, string> = {
  planning: 'Deciding whether to apply',
  applied: 'Application in, waiting on results',
  drawn: 'Drawn — buy the tag',
  notDrawn: 'Not drawn this year',
  purchased: 'Tag in hand',
  complete: 'Season finished',
};

/** Points only matter while the outcome is still ahead of you. */
export function pointsAreRelevant(status: DrawStatus): boolean {
  return status === 'planning' || status === 'applied' || status === 'notDrawn';
}
