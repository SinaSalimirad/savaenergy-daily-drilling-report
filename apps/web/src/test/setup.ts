import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "./api-client-mock";

GlobalRegistrator.register();

// happy-dom rejects an animation's `finished` promise when it is canceled, and the dialog's
// animation library never handles that rejection. Browsers do the same, but Bun fails the
// test run on any unhandled rejection, so mark the promise as handled before canceling.
const originalCancel = Animation.prototype.cancel;
Animation.prototype.cancel = function cancel() {
  this.finished.catch(() => {});
  originalCancel.call(this);
};

// Imported after the DOM exists: testing-library reads `document` when it loads.
const { cleanup } = await import("@testing-library/react");

// Unmount what a test rendered so the next test starts from an empty document.
afterEach(cleanup);
