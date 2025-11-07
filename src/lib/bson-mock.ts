/**
 * Mock bson module for Jest tests
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
