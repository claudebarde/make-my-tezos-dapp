<script>
  import { fly } from "svelte/transition";
  import { backInOut } from "svelte/easing";
  import store from "../store.js";
</script>

<style>
  .toast-processing-tx {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 50;
  }
</style>

{#if $store.processingTransaction === 'sent'}
  <div
    class="notification is-info toast-processing-tx"
    transition:fly={{ delay: 2000, duration: 1000, x: 200, easing: backInOut }}>
    <button
      class="delete"
      on:click={() => store.updateProcessingTransaction(null)} />
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        <span class="icon">
          <i class="fas fa-spinner fa-spin fa-2x" />
        </span>
      </div>
      <div class="column is-10 has-text-left">
        <p>Processing transaction...</p>
        <p>
          <a
            href={`https://you.better-call.dev/${$store.network}/opg/${$store.transactionHash}/contents`}
            target="_blank"
            rel="noopener noreferrer">
            Display transaction
            <span class="icon is-small">
              <i class="fas fa-external-link-alt fa-xs" />
            </span>
          </a>
        </p>
      </div>
    </div>
  </div>
{/if}
{#if $store.processingTransaction === 'success'}
  <div
    class="notification is-success toast-processing-tx"
    transition:fly={{ duration: 1000, x: 200, easing: backInOut }}>
    <button
      class="delete"
      on:click={() => store.updateProcessingTransaction(null)} />
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        <span class="icon">
          <i class="far fa-thumbs-up fa-2x" />
        </span>
      </div>
      <div class="column is-10 has-text-left">
        <p>Transaction successful!</p>
        <p>
          <a
            href={`https://you.better-call.dev/${$store.network}/opg/${$store.transactionHash}/contents`}
            target="_blank"
            rel="noopener noreferrer">
            Display hash
            <span class="icon is-small">
              <i class="fas fa-external-link-alt fa-xs" />
            </span>
          </a>
        </p>
      </div>
    </div>
  </div>
{/if}
{#if $store.processingTransaction === 'error'}
  <div
    class="notification is-danger toast-processing-tx"
    transition:fly={{ duration: 1000, x: 200, easing: backInOut }}>
    <button
      class="delete"
      on:click={() => store.updateProcessingTransaction(null)} />
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        <span class="icon">
          <i class="fas fa-exclamation-triangle fa-2x" />
        </span>
      </div>
      <div class="column is-10 has-text-left">
        <p>An error has occurred!</p>
        <p>
          <a
            href={`https://you.better-call.dev/${$store.network}/opg/${$store.transactionHash}/contents`}
            target="_blank"
            rel="noopener noreferrer">
            Display hash
            <span class="icon is-small">
              <i class="fas fa-external-link-alt fa-xs" />
            </span>
          </a>
        </p>
      </div>
    </div>
  </div>
{/if}
