<script>
  import { slide } from "svelte/transition";
  import store from "../store";
  import { onMount } from "svelte";
  import AddAmount from "./AddAmount.svelte";

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
        values = [];
        amount = "";
        // opens toast
        store.updateProcessingTransaction("success");
        // closes toast after 4 sec
        setTimeout(() => store.updateProcessingTransaction(null), 4000);
        // updates storage
        const storage = await $store.contractInstance.storage();
        store.updateContractStorage(storage);
      } catch (err) {
        console.log(err);
        // opens toast
        store.updateProcessingTransaction("error");
        // closes toast after 4 sec
        setTimeout(() => store.updateProcessingTransaction(null), 4000);
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

  @media only screen and (max-width: 1023px) {
    .address-columns {
      width: 100%;
    }
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
                type="text"
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
          <div class="field">
            <p class="control has-icons-left">
              <input
                type="text"
                class="input is-rounded"
                placeholder="Unavailable"
                value={values[i] || ''}
                disabled />
              <span class="icon is-small is-left">
                <i class="fas fa-times-circle" />
              </span>
            </p>
          </div>
        {/if}
      {/each}
    </div>
    <div class="column is-2">
      <button
        class="button is-rounded"
        class:is-info={$store.userAddress}
        class:is-warning={!$store.userAddress}
        disabled={!$store.userAddress}
        class:is-loading={loading}
        on:click={sendTransaction}>
        Send
      </button>
    </div>
  </div>
  <AddAmount on:newAmount={event => (amount = event.detail)} {amount} />
{/if}
