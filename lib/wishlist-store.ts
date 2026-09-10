declare global {
  var __serverWishlistStore: Map<string, number[]> | undefined;
}

const wishlistStore = globalThis.__serverWishlistStore || (globalThis.__serverWishlistStore = new Map());

export function getServerWishlist(phone: string): number[] {
  return wishlistStore.get(phone) || [];
}

export function setServerWishlist(phone: string, ids: number[]): void {
  wishlistStore.set(phone, ids);
}

export function clearServerWishlist(phone: string): void {
  wishlistStore.delete(phone);
}