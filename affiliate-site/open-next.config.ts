import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// All pages are rendered per request from the database, so no ISR cache is needed.
export default defineCloudflareConfig({});
