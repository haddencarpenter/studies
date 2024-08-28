import * as Sentry from "@sentry/node";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: "https://fff8919d35b70e7bdeed4f5e2d9512e5@o958719.ingest.us.sentry.io/4505873432903680",

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});