import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
	posthog.init(posthogKey, {
		api_host: posthogHost,
		ui_host: "https://us.posthog.com",
		capture_exceptions: true,
		disable_surveys: true,
		disable_session_recording: true,
		debug: process.env.NODE_ENV === "development",
	});
}
