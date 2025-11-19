import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - to be updated after deployment
export const IDENTITY_PACKAGE_ID = process.env.NEXT_PUBLIC_IDENTITY_PACKAGE_ID || '';
export const IDENTITY_REGISTRY_ID = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ID || '';
export const SPACE_PACKAGE_ID = process.env.NEXT_PUBLIC_SPACE_PACKAGE_ID || '';
export const SUBSCRIPTION_PACKAGE_ID = process.env.NEXT_PUBLIC_SUBSCRIPTION_PACKAGE_ID || '';
export const SUBSCRIPTION_REGISTRY_ID = process.env.NEXT_PUBLIC_SUBSCRIPTION_REGISTRY_ID || '';

export const SUI_CLOCK = '0x6';
export const MIST_PER_SUI = 1_000_000_000;

/**
 * Mint a new identity NFT
 */
export const mintIdentity = (username: string, bio: string, avatarBlobId: string, imageBlobId: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${IDENTITY_PACKAGE_ID}::identity::mint_identity`,
    arguments: [
      tx.object(IDENTITY_REGISTRY_ID),
      tx.pure.string(username),
      tx.pure.string(bio),
      tx.pure.string(avatarBlobId),
      tx.pure.string(imageBlobId),
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

/**
 * Bind an avatar to an existing identity (Update avatar)
 */
export const bindAvatar = (identityId: string, avatarBlobId: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${IDENTITY_PACKAGE_ID}::identity::bind_avatar`,
    arguments: [
      tx.object(identityId),
      tx.pure.string(avatarBlobId),
    ],
  });
  return tx;
};

/**
 * Become a creator (upgrade identity)
 */
export const becomeCreator = (identityId: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${IDENTITY_PACKAGE_ID}::identity::become_creator`,
    arguments: [
      tx.object(IDENTITY_REGISTRY_ID),
      tx.object(identityId)
    ],
  });
  return tx;
};

/**
 * Initialize a new space (creates kiosk and initializes space in one transaction)
 */
export const initializeSpace = (
  identityId: string,
  name: string,
  description: string,
  coverImageBlobId: string,
  configQuiltBlobId: string,
  subscriptionPriceInMist: number,
  initPriceInMist: number,
  recipientAddress: string,
) => {
  const tx = new Transaction();
  
  // Create kiosk
  const [kiosk, kioskCap] = tx.moveCall({
    target: "0x2::kiosk::new",
    arguments: [],
  });

  // Pay for space initialization
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(initPriceInMist)]);

  // Initialize space
  tx.moveCall({
    target: `${SPACE_PACKAGE_ID}::space::initialize_space`,
    arguments: [
      tx.object(identityId),
      kiosk,
      kioskCap,
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.string(coverImageBlobId),
      tx.pure.string(configQuiltBlobId),
      tx.pure.u64(subscriptionPriceInMist),
      paymentCoin,
      tx.object(SUI_CLOCK),
    ],
  });

  // Share kiosk
  tx.moveCall({
    target: "0x2::transfer::public_share_object",
    arguments: [kiosk],
    typeArguments: ["0x2::kiosk::Kiosk"],
  });

  // Transfer kiosk cap to user
  tx.transferObjects([kioskCap], tx.pure.address(recipientAddress));

  return tx;
};

/**
 * Update space configuration
 */
export const updateSpaceConfig = (
  kioskId: string,
  kioskCapId: string,
  newConfigQuiltBlobId: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${SPACE_PACKAGE_ID}::space::update_space_config`,
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.string(newConfigQuiltBlobId),
    ],
  });
  return tx;
};

/**
 * Add a fan avatar to a space
 */
export const addFanAvatar = (
  kioskId: string,
  fanAddress: string,
  avatarBlobId: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${SPACE_PACKAGE_ID}::space::add_fan_avatar`,
    arguments: [
      tx.object(kioskId),
      tx.pure.address(fanAddress),
      tx.pure.string(avatarBlobId),
    ],
  });
  return tx;
};

/**
 * Add a video to a space
 */
export const addVideo = (
  kioskId: string,
  kioskCapId: string,
  title: string,
  encryptedBlobId: string,
  sealResourceId: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${SPACE_PACKAGE_ID}::space::add_video`,
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.string(title),
      tx.pure.string(encryptedBlobId),
      tx.pure.string(sealResourceId),
    ],
  });
  return tx;
};

/**
 * Subscribe to a space
 */
export const subscribeToSpace = (
  identityId: string,
  spaceKioskId: string,
  priceInMist: number,
  durationDays: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
  tx.moveCall({
    target: `${SUBSCRIPTION_PACKAGE_ID}::subscription::subscribe`,
    arguments: [
      tx.object(identityId),
      tx.object(spaceKioskId),
      paymentCoin,
      tx.pure.u64(durationDays),
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

/**
 * Renew a subscription
 */
export const renewSubscription = (
  subscriptionId: string,
  priceInMist: number,
  durationDays: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
  tx.moveCall({
    target: `${SUBSCRIPTION_PACKAGE_ID}::subscription::renew_subscription`,
    arguments: [
      tx.object(subscriptionId),
      paymentCoin,
      tx.pure.u64(durationDays),
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

/**
 * Create a transaction for Seal access approval verification
 * This is used with Seal SDK to verify subscription-based access control
 */
export const sealApproveBySubscription = (
  resourceIdBytes: Uint8Array,
  spaceKioskId: string,
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${SPACE_PACKAGE_ID}::space::seal_approve_by_subscription`,
    arguments: [
      tx.pure.vector('u8', Array.from(resourceIdBytes)),
      tx.object(spaceKioskId),
    ],
  });
  
  return tx;
};
