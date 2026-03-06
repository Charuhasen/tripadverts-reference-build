import { VIEWABLE_THRESHOLD_MS, QUALIFIED_THRESHOLD_MS } from "./constants";
import { BillingStatus } from "./types";

export function classifyImpression(attentionMs: number): BillingStatus {
  if (attentionMs >= QUALIFIED_THRESHOLD_MS) return BillingStatus.Qualified;
  if (attentionMs >= VIEWABLE_THRESHOLD_MS) return BillingStatus.Viewable;
  return BillingStatus.OTS;
}
