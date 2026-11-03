import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;
if (!globalThis.CSS) Object.defineProperty(globalThis, "CSS", { value: {} });
if (!CSS.escape)
  CSS.escape = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");
Element.prototype.scrollIntoView = () => {};
