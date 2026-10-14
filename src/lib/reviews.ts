import { SOCIAL_URLS } from "@/lib/social";

// Where people can leave a review. The admin picks which ones go on each link.
export const REVIEW_PLATFORMS = [
  // TODO: swap for the Google Business Profile "Ask for reviews" link (g.page/r/…/review)
  // so the review form opens directly instead of the search results.
  { id: "google", name: "Google", url: SOCIAL_URLS.google, hint: 'Tap "Write a review"' },
  { id: "yelp", name: "Yelp", url: SOCIAL_URLS.yelp, hint: 'Tap "Write a review"' },
  { id: "nextdoor", name: "Nextdoor", url: SOCIAL_URLS.nextdoor, hint: 'Tap "Recommend"' },
  { id: "care", name: "Care.com", url: SOCIAL_URLS.care, hint: "Scroll to Reviews" },
  { id: "facebook", name: "Facebook", url: `${SOCIAL_URLS.facebook}/reviews`, hint: "Tap Yes to recommend" },
] as const;

export type ReviewPlatformId = (typeof REVIEW_PLATFORMS)[number]["id"];

// Links are texted to people, so they always point at production, except in
// local dev where they need to open the dev server.
const SITE = import.meta.env.DEV ? window.location.origin : "https://aamadaycare.com";

export const reviewPageUrl = (token: string) => `${SITE}/review/${token}`;

export const smsHref = (phone: string, body: string) =>
  `sms:${phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(body)}`;

// Drafts wrap the phrases to personalize in {{ }}; this is the text to copy.
export const plainReview = (value: string) => value.replace(/\{\{|\}\}/g, "");
