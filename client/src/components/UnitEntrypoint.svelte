<script>
  import { slide } from "svelte/transition";
  import store from "../store";

  export let entrypointName;

  let amount = "";
  let loading = false;
  let accordionOpen = false;

  const sendTransaction = async () => {
    if (value && $store.contractInstance && entrypointName) {
      loading = true;
      try {
        const op = await $store.contractInstance.methods[entrypointName]([
          ["unit"]
        ]).send(amount ? { amount, mutez: true } : {});
        await op.confirmation();
        value = "";
        amount = "";
        // updates storage
        const storage = await $store.contractInstance.storage();
        store.updateContractStorage(storage);
      } catch (err) {
        console.log(err);
      } finally {
        loading = false;
      }
    }
  };
</script>

<h1 class="title is-6 is-uppercase">{entrypointName}</h1>
<button
  class="button is-rounded"
  class:is-info={$store.userAddress}
  class:is-warning={!$store.userAddress}
  disabled={!$store.userAddress}
  class:is-loading={loading}
  on:click={sendTransaction}>
  Call entrypoint
</button>
<div>
  <p class="accordion-header" on:click={() => (accordionOpen = !accordionOpen)}>
    {#if !amount || accordionOpen}
      Add an amount
    {:else if !!amount && !accordionOpen}
      Added ꜩ {(amount / 1000000).toLocaleString('en-US')} for transaction
    {/if}
  </p>
  {#if accordionOpen}
    <div
      class="columns is-mobile accordion-content"
      transition:slide={{ duration: 500 }}>
      <div class="column is-two-thirds">
        <input
          type="number"
          class="input is-small is-rounded"
          placeholder="Enter the value here"
          bind:value={amount} />
      </div>
      <div class="column is-one-third">
        <button
          class="button is-small is-light is-info is-rounded"
          on:click={() => (accordionOpen = false)}>
          Add
        </button>
      </div>
    </div>
  {/if}
</div>
