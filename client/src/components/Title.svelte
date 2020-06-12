<script>
  import { createEventDispatcher } from "svelte";
  import { push } from "svelte-spa-router";
  import store from "../store";
  import Banner from "./Banner.svelte";

  const dispatch = createEventDispatcher();
</script>

<style>
  .line-1 {
    position: relative;
    top: 50%;
    width: 11.5em;
    margin: 0 auto;
    border-right: 2px solid rgba(255, 255, 255, 0.75);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    transform: translateY(-50%);
    cursor: pointer;
  }

  /* Animation */
  .anim-typewriter {
    animation: typewriter 2s steps(44) 1s 1 normal both,
      blinkTextCursor 700ms steps(44) 1s 20 normal;
  }
  @keyframes typewriter {
    from {
      width: 0;
    }
    to {
      width: 11.5em;
    }
  }
  @keyframes blinkTextCursor {
    from {
      border-right-color: black;
    }
    to {
      border-right-color: transparent;
    }
  }
</style>

<h1
  class="title is-size-2-desktop is-size-3-tablet is-size-4-mobile line-1
  anim-typewriter"
  on:click={() => {
    dispatch('reset');
    store.reset();
    push('/');
  }}>
  Make My Tezos Dapp!
</h1>
<div class="is-hidden-desktop">
  <Banner width="80%" height="80%" />
</div>
<div class="is-hidden-touch">
  <Banner width="35%" height="35%" />
</div>
