import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Imported after the DOM exists: testing-library reads `document` when it loads.
const { cleanup } = await import("@testing-library/react");

// Unmount what a test rendered so the next test starts from an empty document.
afterEach(cleanup);
