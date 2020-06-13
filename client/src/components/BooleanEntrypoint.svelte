<script>
  import { slide } from "svelte/transition";
  import store from "../store";
  import AddAmount from "./AddAmount.svelte";

  export let entrypointName;

  let value = undefined;
  let amount = "";
  let loading = false;
  let accordionOpen = false;

  const sendTransaction = async () => {
    if (value !== undefined && $store.contractInstance && entrypointName) {
      loading = true;
      try {
        const op = await $store.contractInstance.methods[entrypointName](
          value
        ).send(amount ? { amount, mutez: true } : {});
        await op.confirmation();
        value = undefined;
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
    <div class="control">
      <label class="radio">
        <input
          type="radio"
          name={entrypointName}
          checked={value}
          on:change={() => (value = true)} />
        TRUE
      </label>
      <label class="radio">
        <input
          type="radio"
          name={entrypointName}
          checked={!value && value !== undefined}
          on:change={() => (value = false)} />
        FALSE
      </label>
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
