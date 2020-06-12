import { writable } from "svelte/store";

const defaultState = {
  network: "mainnet",
  contractAddress: undefined,
  contractInstance: undefined,
  contractStorage: undefined,
  contractBalance: 0,
  userAddress: undefined,
  userBalance: undefined,
  Tezos: undefined,
  contractInfo: {},
};

const store = () => {
  const { subscribe, set, update } = writable(defaultState);

  return {
    subscribe,
    reset: () => {
      update((currentStore) => ({
        ...defaultState,
        Tezos: currentStore.Tezos,
      }));
    },
    updateContractStorage: (storage) => {
      update((currentStore) => ({ ...currentStore, contractStorage: storage }));
    },
    updateContractInstance: (instance) => {
      update((currentStore) => ({
        ...currentStore,
        contractInstance: instance,
      }));
    },
    updateContractAddress: (address) => {
      update((currentStore) => ({ ...currentStore, contractAddress: address }));
    },
    updateContractBalance: (balance) => {
      update((currentStore) => ({ ...currentStore, contractBalance: balance }));
    },
    updateUserBalance: (balance) => {
      update((currentStore) => ({ ...currentStore, userBalance: balance }));
    },
    updateUserAddress: (address) => {
      update((currentStore) => ({ ...currentStore, userAddress: address }));
    },
    updateNetwork: (network) => {
      update((currentStore) => {
        if (network === "mainnet" && currentStore.Tezos) {
          currentStore.Tezos.setProvider({ rpc: "https://mainnet.SmartPy.io" });
        } else if (network === "carthagenet" && currentStore.Tezos) {
          currentStore.Tezos.setProvider({
            rpc: "https://carthagenet.SmartPy.io",
          });
        }

        return { ...currentStore, network };
      });
    },
    updateTezos: (Tezos) => {
      update((currentStore) => ({ ...currentStore, Tezos }));
    },
    updateContractInfo: (info) => {
      update((currentStore) => ({
        ...currentStore,
        contractInfo: { ...info },
      }));
    },
  };
};

export default store();
