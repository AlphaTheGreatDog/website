import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// Uses Node's built-in scrypt instead of a bcrypt/argon2 package on purpose:
// on a small VPS you don't want to fight native-module builds (node-gyp,
// python, build-essential) every time you `pnpm install` on a fresh box.
// scrypt is memory-hard and considered fine for password storage.

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const hashBuffer = Buffer.from(hash, 'hex')
  const candidateBuffer = scryptSync(password, salt, KEY_LENGTH)

  // Lengths must match before timingSafeEqual will even run.
  if (hashBuffer.length !== candidateBuffer.length) return false
  return timingSafeEqual(hashBuffer, candidateBuffer)
}
