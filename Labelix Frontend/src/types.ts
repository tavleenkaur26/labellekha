export type Page =
  | "landing"
  | "login"
  | "dashboard"
  | "new-scan"
  | "processing"
  | "inspection-result"
  | "consumer-result"
  | "producer-precheck"
  | "ai-assistant"
  | "products"
  | "reports"
  | "settings";

export type NavigateFn = (page: Page) => void;
