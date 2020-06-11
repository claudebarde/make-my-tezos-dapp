<script>
  import Router from "svelte-spa-router";
  import App from "./App.svelte";

  const routes = {
    "/contract/:network/:contract": App,
    "*": App
  };
</script>

<Router {routes} />
