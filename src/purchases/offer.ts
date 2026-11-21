/**
 * How a subscription is described on the paywall. Pure, so the wording that Apple
 * reviews — the price, the trial, the renewal — can be tested rather than eyeballed.
 */

/** The slice of RevenueCat's PurchasesIntroPrice this app reads. */
export interface IntroOffer {
  price: number;
  periodUnit: string;
  periodNumberOfUnits: number;
  cycles: number;
}

export interface TrialLength {
  /** "7 days", "1 week". */
  phrase: string;
  /** "7-day", "1-week" — for "the 7-day trial". */
  adjective: string;
}

/**
 * The length of a free trial, or null when the intro offer is not a free trial (a
 * paid intro price, or none at all).
 */
export function freeTrialLength(intro: IntroOffer | null | undefined): TrialLength | null {
  if (!intro || intro.price !== 0) return null;
  const units = intro.periodNumberOfUnits * Math.max(1, intro.cycles);
  if (units <= 0) return null;
  const unit = intro.periodUnit.toUpperCase();
  const word =
    unit === 'DAY' ? 'day' : unit === 'WEEK' ? 'week' : unit === 'MONTH' ? 'month' : unit === 'YEAR' ? 'year' : null;
  if (!word) return null;
  return { phrase: `${units} ${word}${units === 1 ? '' : 's'}`, adjective: `${units}-${word}` };
}

export interface PlanCopy {
  /** The button's first line. */
  label: string;
  /** The button's second line: always carries the price that will be billed. */
  detail: string;
  /** A plain sentence for under the buttons, or null when there is no trial. */
  terms: string | null;
}

/**
 * The trial is only offered to people the App Store says are eligible — someone who
 * already used it would be charged on day one, and a button that promised otherwise
 * is the fastest route to a refund request. Unknown eligibility shows the plain price,
 * which is RevenueCat's own guidance.
 */
export function planCopy(input: {
  tierName: string;
  priceString: string;
  intro: IntroOffer | null | undefined;
  trialEligible: boolean;
}): PlanCopy {
  const trial = input.trialEligible ? freeTrialLength(input.intro) : null;
  if (!trial) {
    return {
      label: input.tierName,
      detail: `${input.priceString} a year`,
      terms: null,
    };
  }
  return {
    label: `Try ${input.tierName} Free`,
    detail: `${trial.phrase} free, then ${input.priceString} a year`,
    terms: `After the ${trial.adjective} trial, ${input.tierName} renews at ${input.priceString} a year until you cancel. Cancel at least 24 hours before the trial ends and you are not charged.`,
  };
}
