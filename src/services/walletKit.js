import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  xBullModule,
  AlbedoModule,
  HanaModule,
} from "@creit.tech/stellar-wallets-kit";

// Single shared kit instance used across the app.
// selectedWalletId is set once the user picks a wallet in the modal.
export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FreighterModule.id,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new HanaModule(),
  ],
});

/**
 * Opens the multi-wallet selection modal and resolves once the user
 * has picked and connected a wallet.
 * Rejects if the user closes the modal without choosing one, or if the
 * chosen wallet extension isn't installed.
 */
export function openWalletModal() {
  return new Promise((resolve, reject) => {
    kit
      .openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            resolve({ id: option.id, name: option.name, address });
          } catch (err) {
            reject(err);
          }
        },
        onClosed: (err) => {
          if (err) reject(err);
        },
      })
      .catch(reject);
  });
}

export async function signWithKit(xdr, address) {
  return kit.signTransaction(xdr, {
    networkPassphrase: WalletNetwork.TESTNET,
    address,
  });
}
