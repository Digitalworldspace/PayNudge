/** Maps a Polar subscription status to the statuses PayNudge stores. */
export function mapPolarStatus(status: string): string {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "on_hold";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return "pending";
  }
}
