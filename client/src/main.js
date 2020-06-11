import Routes from "./Routes.svelte";

const app = new Routes({
  target: document.body,
});

window.app = app;

export default app;
