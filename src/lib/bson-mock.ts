/**
 * Mock bson and crypto modules for Jest tests
 */

export class ObjectId {
  constructor(public id: string = '000000000000000000000000') {}
  toString(): string {
    return this.id;
  }
  toHexString(): string {
    return this.id;
  }
}

export class Binary {}
export class Code {}
export class DBRef {}
export class Decimal128 {}
export class Double {}
export class Int32 {}
export class Long {}
export class MaxKey {}
export class MinKey {}
export class Timestamp {}
export class UUID {}

// Mock secp256k1 for ethereum crypto
export const secp256k1 = {
  CURVE: {
    p: BigInt(0),
    n: BigInt(0),
  },
};

// Default export for ethereum-cryptography
export default { secp256k1 };
