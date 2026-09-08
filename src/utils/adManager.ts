// Google Ad Manager (GPT - Google Publisher Tag) & Google AdSense Manager

export const ADSENSE_PUB_ID = 'ca-pub-6786401860837559';
export const GAM_NETWORK_CODE = '21775744923';
export const AD_REFRESH_INTERVAL_SECONDS = 30;

export interface GAMSlotConfig {
  path: string;
  divId: string;
  sizes: [number, number][] | [number, number];
}

export const GAM_SLOTS = {
  TOP_LEADERBOARD: {
    path: `/${GAM_NETWORK_CODE}/autophoto_top_leaderboard`,
    divId: 'div-gpt-ad-top-leaderboard',
    sizes: [[728, 90], [970, 90], [468, 60], [320, 50]] as [number, number][],
  },
  BOTTOM_ANCHOR: {
    path: `/${GAM_NETWORK_CODE}/autophoto_bottom_anchor`,
    divId: 'div-gpt-ad-bottom-anchor',
    sizes: [[728, 90], [468, 60], [320, 50]] as [number, number][],
  },
  SMALL_LEADERBOARD: {
    path: `/${GAM_NETWORK_CODE}/autophoto_small_leaderboard`,
    divId: 'div-gpt-ad-small-leaderboard',
    sizes: [[468, 60], [320, 50], [300, 250]] as [number, number][],
  },
  WEB_INTERSTITIAL: {
    path: `/${GAM_NETWORK_CODE}/autophoto_web_interstitial`,
  },
};

// Global slot references
const definedSlots = new Map<string, any>();
let interstitialSlot: any = null;
let isInitialized = false;

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      defineSlot?: (adUnitPath: string, size: any, divId: string) => any;
      defineOutOfPageSlot?: (adUnitPath: string, format: any) => any;
      display?: (divId: string) => void;
      pubads?: () => any;
      enableServices?: () => void;
      enums?: {
        OutOfPageFormat?: {
          INTERSTITIAL?: any;
          BOTTOM_ANCHOR?: any;
          TOP_ANCHOR?: any;
          REWARDED?: any;
        };
      };
    };
    adsbygoogle?: unknown[];
  }
}

/**
 * Initialize Google Publisher Tag (Ad Manager)
 */
export function initGoogleAdManager(): void {
  if (typeof window === 'undefined') return;

  window.googletag = window.googletag || { cmd: [] };

  window.googletag.cmd.push(() => {
    if (isInitialized) return;
    isInitialized = true;

    try {
      const pubads = window.googletag?.pubads?.();
      if (!pubads) return;

      // Link AdSense Client ID
      pubads.set('adsense_client', ADSENSE_PUB_ID);
      pubads.set('adsense_channel_ids', 'autophoto_web');

      // Enable single request & responsive sizing
      pubads.enableSingleRequest();
      pubads.collapseEmptyDivs();

      // Define Web Interstitial Out-Of-Page Slot
      const OutOfPageFormat = window.googletag?.enums?.OutOfPageFormat;
      if (OutOfPageFormat?.INTERSTITIAL && window.googletag?.defineOutOfPageSlot) {
        interstitialSlot = window.googletag.defineOutOfPageSlot(
          GAM_SLOTS.WEB_INTERSTITIAL.path,
          OutOfPageFormat.INTERSTITIAL
        );
        if (interstitialSlot) {
          interstitialSlot.addService(pubads);
        }
      }

      // Define Bottom Anchor Out-Of-Page Slot if supported
      if (OutOfPageFormat?.BOTTOM_ANCHOR && window.googletag?.defineOutOfPageSlot) {
        const anchorSlot = window.googletag.defineOutOfPageSlot(
          GAM_SLOTS.BOTTOM_ANCHOR.path,
          OutOfPageFormat.BOTTOM_ANCHOR
        );
        if (anchorSlot) {
          anchorSlot.addService(pubads);
          definedSlots.set(GAM_SLOTS.BOTTOM_ANCHOR.divId, anchorSlot);
        }
      }

      window.googletag?.enableServices?.();
    } catch {
      // Graceful fallback for sandboxed environments
    }
  });
}

/**
 * Register and display an in-page Google Ad Manager Slot
 */
export function registerGAMSlot(slotConfig: GAMSlotConfig): void {
  if (typeof window === 'undefined') return;

  window.googletag = window.googletag || { cmd: [] };

  window.googletag.cmd.push(() => {
    try {
      if (!definedSlots.has(slotConfig.divId) && window.googletag?.defineSlot) {
        const slot = window.googletag.defineSlot(
          slotConfig.path,
          slotConfig.sizes,
          slotConfig.divId
        );
        if (slot) {
          slot.addService(window.googletag.pubads());
          definedSlots.set(slotConfig.divId, slot);
        }
      }

      // Trigger display
      window.googletag?.display?.(slotConfig.divId);
    } catch {
      // Handled
    }
  });

  // Also push to AdSense pipeline
  pushAdSenseTag();
}

/**
 * Trigger programmatic refresh for Google Ad Manager slots and AdSense
 */
export function refreshAllAdSlots(slotDivIds?: string[]): void {
  if (typeof window === 'undefined') return;

  window.googletag = window.googletag || { cmd: [] };

  window.googletag.cmd.push(() => {
    try {
      const pubads = window.googletag?.pubads?.();
      if (!pubads) return;

      if (slotDivIds && slotDivIds.length > 0) {
        const targetSlots = slotDivIds
          .map((id) => definedSlots.get(id))
          .filter(Boolean);
        if (targetSlots.length > 0) {
          pubads.refresh(targetSlots);
        } else {
          pubads.refresh();
        }
      } else {
        pubads.refresh();
      }
    } catch {
      // Handled
    }
  });

  pushAdSenseTag();
}

/**
 * Trigger Real Google Ad Manager Web Interstitial
 */
export function triggerWebInterstitial(): void {
  if (typeof window === 'undefined') return;

  window.googletag = window.googletag || { cmd: [] };

  window.googletag.cmd.push(() => {
    try {
      const pubads = window.googletag?.pubads?.();
      if (pubads && interstitialSlot) {
        pubads.refresh([interstitialSlot]);
      }
    } catch {
      // Handled
    }
  });

  pushAdSenseTag();
}

/**
 * Push real AdSense tag invocation
 */
export function pushAdSenseTag(): void {
  if (typeof window === 'undefined') return;
  try {
    const windowWithAds = window as unknown as { adsbygoogle?: unknown[] };
    windowWithAds.adsbygoogle = windowWithAds.adsbygoogle || [];
    windowWithAds.adsbygoogle.push({});
  } catch {
    // Handled
  }
}
