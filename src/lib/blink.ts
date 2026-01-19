import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID as string,
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY as string,
  auth: { mode: 'managed' },
});
