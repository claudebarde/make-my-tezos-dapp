<script>
  import store from "../store";
</script>

<style>
  .storage-display {
    word-break: break-word;
    width: 70%;
    margin: 0 auto;
  }
</style>

{#if $store.contractStorage}
  {#each Object.keys($store.contractStorage) as element}
    {#if $store.contractStorage[element] && $store.contractStorage[element].__proto__}
      {#if $store.contractStorage[element].__proto__.constructor.name === 'String'}
        <div
          class="columns has-text-left-desktop has-text-centered-touch
          is-vcentered storage-display">
          <div class="column is-one-third has-text-weight-bold">{element}</div>
          <div class="column is-two-thirds">
            {$store.contractStorage[element]}
          </div>
        </div>
      {:else if $store.contractStorage[element].__proto__.constructor.hasOwnProperty('isBigNumber')}
        <div
          class="columns has-text-left-desktop has-text-centered-touch
          is-vcentered storage-display">
          <div class="column is-one-third has-text-weight-bold">{element}</div>
          <div class="column is-two-thirds">
            {$store.contractStorage[element].toNumber().toLocaleString('en-US')}
          </div>
        </div>
      {:else if $store.contractStorage[element].__proto__.constructor.hasOwnProperty('isMichelsonMap')}
        <div
          class="columns has-text-left-desktop has-text-centered-touch
          is-vcentered storage-display">
          <div class="column is-one-third has-text-weight-bold">{element}</div>
          <div class="column is-two-thirds">Map</div>
        </div>
      {:else if $store.contractStorage[element].schema && $store.contractStorage[element].schema.hasOwnProperty('bigMap')}
        <div
          class="columns has-text-left-desktop has-text-centered-touch
          is-vcentered storage-display">
          <div class="column is-one-third has-text-weight-bold">{element}</div>
          <div class="column is-two-thirds">BigMap</div>
        </div>
      {:else}
        <div
          class="columns has-text-left-desktop has-text-centered-touch
          is-vcentered storage-display">
          <div class="column is-one-third has-text-weight-bold">{element}</div>
          <div class="column is-two-thirds">
            {$store.contractStorage[element]}
          </div>
        </div>
      {/if}
    {:else}
      <div
        class="columns has-text-left-desktop has-text-centered-touch
        is-vcentered storage-display">
        <div class="column is-one-third has-text-weight-bold">{element}</div>
        <div class="column is-two-thirds">
          {$store.contractStorage[element]}
        </div>
      </div>
    {/if}
  {:else}
    <div class="message is-info">
      <div class="message-body">No storage found!</div>
    </div>
  {/each}
{/if}
