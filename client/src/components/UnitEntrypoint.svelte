<script>
  import { slide } from "svelte/transition";
  import store from "../store";
  import AddAmount from "./AddAmount.svelte";

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
<br />
<br />
<AddAmount on:newAmount={event => (amount = event.detail)} {amount} />
