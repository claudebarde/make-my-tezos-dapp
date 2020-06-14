<script>
  import { slide } from "svelte/transition";
  import store from "../store";
  import AddAmount from "./AddAmount.svelte";

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
        store.updateTransactionHash(op.opHash);
        // opens toast
        store.updateProcessingTransaction("sent");
        // closes toast after 4 sec
        setTimeout(() => store.updateProcessingTransaction(null), 4000);
        // waits for confirmation
        await op.confirmation();
        value = "";
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
</script>

<style>
  .address-columns {
    max-width: 80%;
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
