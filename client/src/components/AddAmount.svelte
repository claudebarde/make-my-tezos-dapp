<script>
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  export let amount;

  const dispatch = createEventDispatcher();
  let accordionOpen = false;
</script>

<style>
  .accordion-header {
    background-color: #dbdbdb;
    padding: 7px;
    cursor: pointer;
    border-radius: 5px;
    width: 40%;
    margin: 0 auto;
  }
  .accordion-header:hover {
    background-color: #b5b5b5;
  }

  .accordion-content {
    padding: 10px;
    width: 40%;
    margin: 0 auto;
  }

  @media only screen and (max-width: 1023px) {
    .accordion-header {
      width: 70%;
    }

    .accordion-content {
      padding: 20px;
      width: 70%;
    }
  }
</style>

<div>
  <p
    class="accordion-header is-size-7"
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
          value={amount}
          on:input={e => dispatch('newAmount', e.target.value)} />
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
