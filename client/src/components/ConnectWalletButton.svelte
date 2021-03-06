<script>
  import { fly } from "svelte/transition";
  import { backInOut } from "svelte/easing";
  import { TezBridgeSigner } from "@taquito/tezbridge-signer";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import { ThanosWallet } from "@thanos-wallet/dapp";
  import store from "../store";

  export let loadingContract;

  let beaconRequestSent = false;
  let beaconTxHash = undefined;

  const initTezBridgeWallet = async () => {
    try {
      // gets user's address
      const address = await window.tezbridge.request({ method: "get_source" });
      store.updateUserAddress(address);
      // updates Tezos Provider
      $store.Tezos.setSignerProvider(new TezBridgeSigner());
      // gets user's balance
      const balance = await $store.Tezos.tz.getBalance(address);
      store.updateUserBalance(balance);
    } catch (error) {
      console.log("error fetching the address or balance:", error);
    }
  };

  const initBeaconWallet = async () => {
    // initialize beacon wallet
    try {
      const wallet = new BeaconWallet({
        name: "MakeMyDapp",
        iconUrl: "https://makemytezosdapp.netlify.app/favicon.png",
        eventHandlers: {
          PERMISSION_REQUEST_SUCCESS: {
            handler: async data => {
              console.log("permission data:", data);
            }
          },
          OPERATION_REQUEST_SENT: {
            handler: async data => {
              console.log("operation sent data:", data);
            }
          },
          OPERATION_REQUEST_SUCCESS: {
            handler: async data => {
              console.log("operation success data:", data);
            }
          }
        }
      });
      console.log(wallet);
      const initNetwork = {
        type: $store.network
      };
      $store.Tezos.setWalletProvider(wallet);

      await wallet.requestPermissions({ network: initNetwork });
      if (wallet.permissions.address) {
        // saves user's address
        const address = wallet.permissions.address;
        store.updateUserAddress(address);
        // gets user's balance
        const balance = await $store.Tezos.tz.getBalance(
          wallet.permissions.address
        );
        store.updateUserBalance(balance);
      } else {
        throw "No address";
      }
    } catch (err) {
      console.log(err);
    }
  };

  const initThanosWallet = async () => {
    try {
      const available = await ThanosWallet.isAvailable();
      if (!available) {
        throw new Error("Thanos Wallet not installed");
      }
      const wallet = new ThanosWallet("Make My Dapp!");
      await wallet.connect($store.network);
      $store.Tezos.setWalletProvider(wallet);
      // saves address
      store.updateUserAddress(wallet.pkh);
      // saves balance
      const balance = await $store.Tezos.tz.getBalance(wallet.pkh);
      store.updateUserBalance(balance);
    } catch (error) {
      console.log(error);
      // opens toast
      store.updateProcessingTransaction("error");
      // closes toast after 4 sec
      setTimeout(() => store.updateProcessingTransaction(null), 4000);
    }
  };
</script>

<style>
  .wallet-icon {
    height: 20px;
    width: 20px;
    vertical-align: middle;
    margin-right: 20px;
  }

  a {
    text-decoration: none;
  }

  .account-info {
    justify-content: center !important;
  }
</style>

<section class="section">
  {#if !loadingContract}
    {#if $store.userAddress && $store.userBalance}
      <div class="tags has-addons account-info">
        <span class="tag is-primary is-medium">
          ꜩ {($store.userBalance.toNumber() / 1000000).toLocaleString()}
        </span>
        <span class="tag is-dark is-medium">
          {$store.userAddress.slice(0, 10) + '...' + $store.userAddress.slice(-10)}
        </span>
        <span class="tag is-warning is-medium">{$store.network}</span>
      </div>
    {:else}
      <div class="dropdown is-hoverable">
        <div class="dropdown-trigger">
          <button
            class="button is-rounded is-link"
            aria-haspopup="true"
            aria-controls="dropdown-connect-wallet">
            <span class="icon">
              <i class="fas fa-wallet" />
            </span>
            <span>Connect your wallet</span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-connect-wallet" role="menu">
          <div class="dropdown-content">
            <a
              href="#/"
              class="dropdown-item has-text-left"
              on:click|preventDefault={initTezBridgeWallet}>
              <img
                src="tezbridge-icon.png"
                alt="tezbridge"
                class="wallet-icon" />
              <strong>TezBridge</strong>
            </a>
            <a
              href="#/"
              class="dropdown-item has-text-left"
              on:click|preventDefault={initBeaconWallet}>
              <img src="beacon-icon.png" alt="beacon" class="wallet-icon" />
              <strong>Beacon</strong>
            </a>
            <a
              href="#/"
              class="dropdown-item has-text-left"
              on:click|preventDefault={initThanosWallet}>
              <img src="thanos-icon.png" alt="thanos" class="wallet-icon" />
              <strong>Thanos</strong>
            </a>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <button class="button is-rounded is-info is-light">
      <span class="icon">
        <i class="fas fa-spinner fa-spin" />
      </span>
      <span>Contract is loading...</span>
    </button>
  {/if}
</section>
