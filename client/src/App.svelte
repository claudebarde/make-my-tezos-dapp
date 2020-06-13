<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import { validateContractAddress } from "@taquito/utils";
  import { Tezos } from "@taquito/taquito";
  import ConnectWalletButton from "./components/ConnectWalletButton.svelte";
  import Title from "./components/Title.svelte";
  import AddressEntrypoint from "./components/AddressEntrypoint.svelte";
  import UnitEntrypoint from "./components/UnitEntrypoint.svelte";
  import NumberEntrypoint from "./components/NumberEntrypoint.svelte";
  import StringEntrypoint from "./components/StringEntrypoint.svelte";
  import PairEntrypoint from "./components/PairEntrypoint.svelte";
  import BooleanEntrypoint from "./components/BooleanEntrypoint.svelte";
  import StorageDisplay from "./components/StorageDisplay.svelte";
  import TxNotifications from "./components/TxNotifications.svelte";
  import store from "./store";

  export let params;

  let inputContractAddress = "";
  let chooseNetwork = false;
  let network = "mainnet";
  let validContractAddress = false;
  let loadingContract = true;
  let loadingError = false;
  let entrypoints = [];
  const approvedEntrypoints = [
    "nat",
    "pair",
    "unit",
    "address",
    "int",
    "string",
    "mutez",
    "bool"
  ];

  const newContractAddress = async () => {
    if (validateContractAddress(inputContractAddress)) {
      loadingContract = true;
      store.updateContractAddress(inputContractAddress);
      validContractAddress = true;
      await loadContract(inputContractAddress);
      loadingContract = false;
    } else {
      console.error("Invalid contract address");
    }
  };

  const loadContract = async address => {
    window.scrollTo(0, 0);
    let contractInstance, contractStorage;
    loadingError = false;
    try {
      // loads contract instance
      contractInstance = await Tezos.wallet.at(address);
      store.updateContractInstance(contractInstance);
      //console.log(contractInstance);
      // fetches the storage
      contractStorage = await contractInstance.storage();
      //console.log(contractStorage);
      store.updateContractStorage(contractStorage);
    } catch (err) {
      console.log(err);
      loadingContract = false;
      loadingError = true;
      return;
    }
    // parses contract methods
    const contractEntrypoints = await contractInstance.entrypoints.entrypoints;
    // gets contract method names
    // removes methods that start with "get" and parses entrypoint name and parameters
    const extractPairArgs = args => {
      let values = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i].args) {
          // if more arguments
          values.push({ val: extractPairArgs(args[i].args) });
        } else {
          const newVal = { val: args[i].prim };
          if (args[i].annots) newVal.annots = args[i].annots[0];

          values.push(newVal);
        }
      }
      return values.flat();
    };
    entrypoints = Object.keys(contractEntrypoints)
      .filter(entr => entr.slice(0, 3) !== "get")
      .filter(entr =>
        approvedEntrypoints.includes(contractEntrypoints[entr].prim)
      )
      .map(entr => {
        if (contractEntrypoints[entr].prim === "pair") {
          return {
            name: entr,
            argument: extractPairArgs(contractEntrypoints[entr].args)
          };
        } else {
          return {
            name: entr,
            argument: { val: contractEntrypoints[entr].prim || null }
          };
        }
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
    //console.log(entrypoints);
    // gets additional info about the smart contract
    const info = await fetch(
      $store.network === "mainnet"
        ? `https://api.tzkt.io/v1/contracts/${address}`
        : `https://api.carthage.tzkt.io/v1/contracts/${address}`
    );
    const result = await info.json();
    if (result.type && result.type === "contract") {
      store.updateContractInfo({
        alias: result.alias,
        balance: result.balance
      });
    }
  };

  onMount(async () => {
    if (
      params.network &&
      ["mainnet", "carthagenet"].includes(params.network) &&
      params.contract &&
      validateContractAddress(params.contract)
    ) {
      store.updateContractAddress(params.contract);
      Tezos.setProvider({ rpc: `https://${params.network}.SmartPy.io` });
      store.updateTezos(Tezos);
      store.updateNetwork(params.network);
      validContractAddress = true;
      await loadContract(params.contract);
      loadingContract = false;
    } else {
      Tezos.setProvider({ rpc: `https://mainnet.SmartPy.io` });
      store.updateTezos(Tezos);
    }
  });
</script>

<style>
  main {
    padding: 10px 0px;
    font-family: "Montserrat", sans-serif;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    min-height: 92vh;
  }

  .enter-contract-address {
    align-items: flex-end !important;
  }

  .network-selection {
    text-decoration: none;
    color: inherit;
  }

  .network-icon {
    vertical-align: middle;
    margin-right: 10px;
  }

  .copy-contract-link {
    margin-left: 10px;
    vertical-align: middle;
    cursor: pointer;
    opacity: 0.6;
  }

  .entrypoint {
    padding: 30px 20px;
    margin: 0 auto;
    width: 70%;
  }

  .smart-contract-title {
    width: 50%;
    margin: 0 auto;
  }

  .balance-display {
    margin-top: -10px;
  }

  .storage-section {
    padding: 30px;
    margin: 30px 0px;
  }

  .landing-page {
    width: 70%;
    margin: 0 auto;
  }

  footer {
    text-align: center;
    margin-top: 50px;
  }

  @media only screen and (max-width: 1023px) {
    .entrypoint {
      padding: 30px 10px;
      width: 100%;
    }
  }
</style>

<TxNotifications />
<main>
  <section class="section">
    <Title
      on:reset={() => {
        validContractAddress = false;
        inputContractAddress = '';
        entrypoints = [];
        $store.Tezos.setProvider({ rpc: `https://mainnet.SmartPy.io` });
      }} />
  </section>
  {#if validContractAddress}
    <section>
      <div class="container">
        <div class="is-hidden-desktop">
          <p class="title is-5">
            {$store.contractAddress.slice(0, 10) + '...' + $store.contractAddress.slice(-10)}
            <span
              class="icon is-small copy-contract-link"
              on:click={() => {
                const aux = document.createElement('input');
                aux.setAttribute('value', `${process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : 'https://makemytezosdapp.netlify.app/'}/#/contract/${$store.network}/${$store.contractAddress}`);
                document.body.appendChild(aux);
                aux.select();
                document.execCommand('copy');
                document.body.removeChild(aux);
              }}>
              <i class="far fa-copy" />
            </span>
          </p>
          <div class="columns is-mobile is-vcentered has-text-centered">
            <div class="column is-one-third">
              <img
                src={`https://services.tzkt.io/v1/avatars/${$store.contractAddress}`}
                alt="tzkitty"
                class="image is-64x64"
                style="margin:0 auto" />
            </div>
            <div class="column is-two-thirds">
              <p class="title is-4">
                {#if $store.contractInfo.alias}
                  {$store.contractInfo.alias}
                {:else}Smart contract{/if}
              </p>
            </div>
          </div>
        </div>
        <div class="media smart-contract-title is-hidden-touch">
          <div class="media-left">
            <img
              src={`https://services.tzkt.io/v1/avatars/${$store.contractAddress}`}
              alt="tzkitty"
              class="image is-96x96" />
          </div>
          <div class="media-content">
            <div class="content has-text-left">
              <p class="title">
                {#if $store.contractInfo.alias}
                  {$store.contractInfo.alias}
                {:else}Smart contract{/if}
              </p>
              <p class="subtitle is-4">
                {$store.contractAddress.slice(0, 10) + '...' + $store.contractAddress.slice(-10)}
                <span
                  class="icon is-small copy-contract-link"
                  on:click={() => {
                    const aux = document.createElement('input');
                    aux.setAttribute('value', `${process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : 'https://makemytezosdapp.netlify.app/'}/#/contract/${$store.network}/${$store.contractAddress}`);
                    document.body.appendChild(aux);
                    aux.select();
                    document.execCommand('copy');
                    document.body.removeChild(aux);
                  }}>
                  <i class="far fa-copy" />
                </span>
              </p>
              {#if $store.contractInfo.balance}
                <p class="balance-display">
                  Balance: ꜩ {($store.contractInfo.balance / 1000000).toLocaleString('en-US')}
                </p>
              {/if}
            </div>
          </div>
        </div>
        <ConnectWalletButton {loadingContract} />
      </div>
    </section>
    {#if !loadingContract && !loadingError}
      <section class="storage-section has-background-info-light">
        <div class="container">
          <h1 class="title is-4 is-italic">
            <span class="network-icon">
              <i class="fas fa-database" />
            </span>
            <span>Storage</span>
          </h1>
          <StorageDisplay />
        </div>
      </section>
      <section>
        <div class="container">
          <h1 class="title is-4 is-italic">
            <span class="network-icon">
              <i class="fas fa-network-wired" />
            </span>
            <span>Entrypoints</span>
          </h1>
          {#each entrypoints as entrypoint, i}
            {#if entrypoint.argument.val === 'unit'}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <UnitEntrypoint entrypointName={entrypoint.name} />
                </div>
              {:else}
                <div class="entrypoint">
                  <UnitEntrypoint entrypointName={entrypoint.name} />
                </div>
              {/if}
            {:else if entrypoint.argument.val === 'address'}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <AddressEntrypoint entrypointName={entrypoint.name} />
                </div>
              {:else}
                <div class="entrypoint">
                  <AddressEntrypoint entrypointName={entrypoint.name} />
                </div>
              {/if}
            {:else if entrypoint.argument.val === 'nat' || entrypoint.argument.val === 'int' || entrypoint.argument.val === 'mutez'}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <NumberEntrypoint
                    entrypointName={entrypoint.name}
                    arg={entrypoint.argument} />
                </div>
              {:else}
                <div class="entrypoint">
                  <NumberEntrypoint
                    entrypointName={entrypoint.name}
                    arg={entrypoint.argument} />
                </div>
              {/if}
            {:else if entrypoint.argument.val === 'string'}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <StringEntrypoint entrypointName={entrypoint.name} />
                </div>
              {:else}
                <div class="entrypoint">
                  <StringEntrypoint entrypointName={entrypoint.name} />
                </div>
              {/if}
            {:else if entrypoint.argument.val === 'bool'}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <BooleanEntrypoint entrypointName={entrypoint.name} />
                </div>
              {:else}
                <div class="entrypoint">
                  <BooleanEntrypoint entrypointName={entrypoint.name} />
                </div>
              {/if}
            {:else if Array.isArray(entrypoint.argument)}
              {#if i % 2 !== 0}
                <div class="has-background-light entrypoint">
                  <PairEntrypoint
                    entrypointName={entrypoint.name}
                    args={entrypoint.argument} />
                </div>
              {:else}
                <div class="entrypoint">
                  <PairEntrypoint
                    entrypointName={entrypoint.name}
                    args={entrypoint.argument} />
                </div>
              {/if}
            {:else}
              <!-- else content here -->
            {/if}
          {:else}
            <div class="message is-info">
              <div class="message-body">No entrypoint found!</div>
            </div>
          {/each}
        </div>
      </section>
    {:else if loadingError}
      <div class="message is-danger">
        <div class="message-body">
          There was an error while loading this contract.
          <br />
          Please check if the network name is correct and try again.
        </div>
      </div>
    {/if}
  {:else}
    <section class="landing-page">
      <div class="columns enter-contract-address">
        <div class="column is-10">
          <label
            for="contract-address-input"
            class="is-size-5 has-text-weight-bold">
            Enter the smart contract address below:
          </label>
          <div class="field">
            <p class="control has-icons-left">
              <input
                id="contract-address-input"
                type="text"
                class="input is-large is-rounded"
                placeholder="Address"
                bind:value={inputContractAddress}
                on:keyup={event => {
                  if (event.keyCode === 13 || event.key === 'Enter') {
                    newContractAddress();
                  }
                }} />
              <span class="icon is-small is-left">
                <i class="fas fa-search" />
              </span>
            </p>
          </div>
        </div>
        <div class="column is-2">
          <div class="dropdown is-right" class:is-active={chooseNetwork}>
            <div class="dropdown-trigger">
              <button
                class="button is-large is-rounded is-info"
                aria-haspopup="true"
                aria-controls="dropdown-network"
                on:click={() => (chooseNetwork = !chooseNetwork)}>
                {#if chooseNetwork}
                  <span class="icon is-small">
                    <i class="fas fa-angle-up" aria-hidden="true" />
                  </span>
                {:else}
                  <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true" />
                  </span>
                {/if}
                <span>
                  {$store.network[0].toUpperCase() + $store.network.slice(1)}
                </span>
              </button>
            </div>
            {#if chooseNetwork}
              <div
                class="dropdown-menu"
                id="dropdown-network"
                role="menu"
                transition:fly={window.innerWidth > 769 ? { duration: 800, x: 400, easing: elasticOut } : {}}>
                <div class="dropdown-content has-text-left">
                  <a
                    href="#/"
                    class="dropdown-item is-size-5 network-selection"
                    on:click|preventDefault={() => {
                      store.updateNetwork('mainnet');
                      chooseNetwork = false;
                    }}>
                    <span class="icon network-icon">
                      <i class="fas fa-plug" />
                    </span>
                    Mainnet
                  </a>
                  <a
                    href="#/"
                    class="dropdown-item is-size-5 network-selection"
                    on:click|preventDefault={() => {
                      store.updateNetwork('carthagenet');
                      chooseNetwork = false;
                    }}>
                    <span class="icon network-icon">
                      <i class="fas fa-plug" />
                    </span>
                    Carthagenet
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="menu" style="display:inline-block">
        <p class="menu-label">Smart Contract Examples</p>
        <ul class="menu-list">
          <li
            on:click={() => {
              store.updateNetwork('carthagenet');
              inputContractAddress = 'KT1PCLg8Da8T5h5SWibMopPVsxiKg27tSRxx';
              newContractAddress();
            }}>
            <a href="#/">Demo Contract</a>
          </li>
          <li
            on:click={() => {
              store.updateNetwork('mainnet');
              inputContractAddress = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';
              newContractAddress();
            }}>
            <a href="#/">tzBTC</a>
          </li>
          <li
            on:click={() => {
              store.updateNetwork('mainnet');
              inputContractAddress = 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9';
              newContractAddress();
            }}>
            <a href="#/">USDtz</a>
          </li>
        </ul>
      </div>
    </section>
  {/if}
</main>
<footer class="is-size-7 is-hidden-touch">
  🌮🌮 Claude Barde 2020 - Created with
  <a
    href="https://staging.api.tzkt.io/"
    target="_blank"
    rel="noreferrer noopener">
    Baking Bad's TzKT API (v1.0)
  </a>
  and
  <a href="https://tzkt.io" target="_blank" rel="noreferrer noopener">
    Tzkitty API
  </a>
  🌮🌮
</footer>
<footer class="is-size-7 is-hidden-desktop">
  🌮🌮 Claude Barde 2020 🌮🌮
  <br />
  Created with
  <a
    href="https://staging.api.tzkt.io/"
    target="_blank"
    rel="noreferrer noopener">
    Baking Bad's TzKT API (v1.0)
  </a>
  and
  <a href="https://tzkt.io" target="_blank" rel="noreferrer noopener">
    Tzkitty API
  </a>
</footer>
