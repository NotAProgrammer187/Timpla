// Framework-free id helper. IDs are client-generated UUIDv4 strings (API.md §0.2) —
// the server never mints an id for a synced row.
import { randomUUID } from 'expo-crypto';

export function newId(): string {
  return randomUUID();
}
