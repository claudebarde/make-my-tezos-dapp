<script>
  import { slide } from "svelte/transition";
  import store from "../store";
  import { onMount } from "svelte";

  export let entrypointName, args;

  let complexValues = false;

  let values = [];
  let amount = "";
  let loading = false;
  let accordionOpen = false;

  const sendTransaction = async () => {
    if (values.length > 0 && $store.contractInstance && entrypointName) {
      loading = true;
      try {
        const op = await $store.contractInstance.methods[entrypointName](
          ...values
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

  onMount(() => {
    if (args.length > 5 || args.includes("bytes")) {
      complexValues = true;
    }
  });
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
{#if complexValues}
  <div class="message is-warning">
    <div class="message-body">
      <div class="columns is-mobile is-vcentered">
        <div class="column is-1">
          <span class="icon is-large">
            <i class="fas fa-exclamation-circle fa-2x" />
          </span>
        </div>
        <div class="column is-11">
          <p>This entry point seems to accept complex or numerous arguments.</p>
          <p>Entrypoint update has been deactivated.</p>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="columns is-vcentered address-columns">
    <div class="column is-10">
      {#each args as arg, i}
        {#if arg.annots}
          <p class="has-text-left" style="padding-left:20px">
            <label
              for={entrypointName + '-' + arg.val + i}
              class="is-uppercase has-text-left">
              {arg.annots.replace(':', '')}:
            </label>
          </p>
        {/if}
        {#if arg.val === 'address'}
          <div class="field">
            <p class="control has-icons-left">
              <input
                id={entrypointName + '-' + arg.val + i}
                type="text"
                class="input is-rounded"
                placeholder="Enter the address here"
                value={values[i] || ''}
                on:input={event => (values[i] = event.target.value)} />
              <span class="icon is-small is-left">
                <i class="fas fa-search" />
              </span>
            </p>
          </div>
        {:else if arg.val === 'int' || arg.val === 'nat' || arg.val === 'mutez'}
          <div class="field">
            <p class="control has-icons-left">
              <input
                type="number"
                class="input is-rounded"
                placeholder={`Enter the value here ${arg.val === 'mutez' ? 'in mutez' : ''}`}
                value={values[i] || ''}
                on:input={event => (values[i] = event.target.value)} />
              <span class="icon is-small is-left">
                <i class="fas fa-calculator" />
              </span>
            </p>
          </div>
        {:else if arg.val === 'string'}
          <div class="field">
            <p class="control has-icons-left">
              <input
                type="number"
                class="input is-rounded"
                placeholder="Enter the value here"
                value={values[i] || ''}
                on:input={event => (values[i] = event.target.value)} />
              <span class="icon is-small is-left">
                <i class="far fa-keyboard" />
              </span>
            </p>
          </div>
        {:else}
          <!-- else content here -->
        {/if}
      {/each}
    </div>
    <div class="column is-2">
      <button class="button is-info is-rounded">Send</button>
    </div>
  </div>
  <div>
    <p
      class="accordion-header"
      on:click={() => (accordionOpen = !accordionOpen)}>
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
{/if}
