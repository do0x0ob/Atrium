import { Transaction } from '@mysten/sui/transactions';
import { KioskTransaction, KioskClient } from '@mysten/kiosk';

export interface KioskCapData {
  objectId: string;
  kioskId: string;
  isPersonal?: boolean;
}

export function listNFT(
  nftId: string,
  nftType: string,
  price: bigint,
  kioskCapId: string | KioskCapData,
  kioskClient: KioskClient
): Transaction {
  if (!kioskClient) {
    throw new Error('kioskClient is required but was undefined');
  }
  if (!kioskCapId) {
    throw new Error('kioskCapId is required but was undefined');
  }

  const tx = new Transaction();
  const cap = typeof kioskCapId === 'string' ? kioskCapId : kioskCapId;

  const kioskTx = new KioskTransaction({ 
    transaction: tx, 
    kioskClient,
    cap: cap as any,
  });
  
  kioskTx.list({
    itemId: nftId,
    itemType: nftType,
    price,
  });

  kioskTx.finalize();

  return tx;
}

export function delistNFT(
  nftId: string,
  nftType: string,
  kioskCapId: string | KioskCapData,
  kioskClient: KioskClient
): Transaction {
  if (!kioskClient) {
    throw new Error('kioskClient is required but was undefined');
  }
  if (!kioskCapId) {
    throw new Error('kioskCapId is required but was undefined');
  }

  const tx = new Transaction();
  const cap = typeof kioskCapId === 'string' ? kioskCapId : kioskCapId;

  const kioskTx = new KioskTransaction({ 
    transaction: tx, 
    kioskClient,
    cap: cap as any,
  });
  
  kioskTx.delist({
    itemId: nftId,
    itemType: nftType,
  });

  kioskTx.finalize();

  return tx;
}

export async function purchaseNFT(
  sellerKioskId: string,
  nftId: string,
  nftType: string,
  price: bigint,
  buyerKioskCapId: string,
  kioskClient: KioskClient
): Promise<Transaction> {
  const tx = new Transaction();

  const kioskTx = new KioskTransaction({ 
    transaction: tx, 
    kioskClient,
    cap: buyerKioskCapId as any,
  });

  await kioskTx.purchaseAndResolve({
    itemId: nftId,
    itemType: nftType,
    price,
    sellerKiosk: sellerKioskId,
  });

  kioskTx.finalize();

  return tx;
}

export function placeNFT(
  nftId: string,
  nftType: string,
  kioskCapId: string,
  kioskClient: KioskClient
): Transaction {
  const tx = new Transaction();

  const kioskTx = new KioskTransaction({ 
    transaction: tx, 
    kioskClient,
    cap: kioskCapId as any,
  });
  
  kioskTx.place({
    itemType: nftType,
    item: tx.object(nftId),
  });

  kioskTx.finalize();

  return tx;
}

export function takeNFT(
  nftId: string,
  nftType: string,
  kioskCapId: string,
  kioskClient: KioskClient,
  recipientAddress: string
): Transaction {
  const tx = new Transaction();

  const kioskTx = new KioskTransaction({ 
    transaction: tx, 
    kioskClient,
    cap: kioskCapId as any,
  });
  
  const item = kioskTx.take({
    itemType: nftType,
    itemId: nftId,
  });

  tx.transferObjects([item], tx.pure.address(recipientAddress));

  kioskTx.finalize();

  return tx;
}

