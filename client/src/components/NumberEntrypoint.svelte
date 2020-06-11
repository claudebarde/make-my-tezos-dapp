<script>
  import { slide } from "svelte/transition";
  import store from "../store";

  export let entrypointName, arg;

  let value = "";
  let amount = "";
  let loading = false;
  let accordionOpen = false;

  const sendTransaction = async () => {
    if (value && $store.contractInstance && entrypointName) {
      loading = true;
      try {
        const op = await $store.contractInstance.methods[entrypointName](
          value
        ).send(amount ? { amount, mutez: true } : {});
        await op.confirmation();
        value = "";
        amount = "";
      } catch (err) {
        console.log(err);
      } finally {
        loading = false;
      }
    }
  };
</script>

<style>
  .address-columns {
    max-width: 80%;
    margin: 0 auto;
  }

  .accordion-header {
    background-color: #dbdbdb;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
    width: 50%;
    margin: 0 auto;
  }
  .accordion-header:hover {
    background-color: #b5b5b5;
  }

  .accordion-content {
    padding: 10px;
    width: 50%;
    margin: 0 auto;
  }
</style>

<h1 class="title is-6 is-uppercase">{entrypointName}</h1>
<div class="columns address-columns">
  <div class="column is-10">
    <div class="field">
      <p class="control has-icons-left">
        <input
          type="number"
          class="input is-rounded"
          placeholder={`Enter the value here ${arg === 'mutez' ? 'in mutez' : ''}`}
          bind:value
          disabled={loading} />
        <span class="icon is-small is-left">
          <i class="fas fa-calculator" />
        </span>
      </p>
    </div>
  </div>
  <div class="column is-2">
    <button
      class="button is-info is-rounded"
      class:is-loading={loading}
      on:click={sendTransaction}>
      Send
    </button>
  </div>
</div>
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
          placeholder="Amount in mutez"
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
