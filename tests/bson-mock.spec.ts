/**
 * Tests for BSON mock classes
 */

import {
  ObjectId,
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  Timestamp,
  UUID,
  secp256k1,
} from '../src/lib/bson-mock';

describe('bson-mock', () => {
  describe('ObjectId', () => {
    it('should create with default id', () => {
      const oid = new ObjectId();
      expect(oid.id).toBe('000000000000000000000000');
    });

    it('should create with custom id', () => {
      const customId = '507f1f77bcf86cd799439011';
      const oid = new ObjectId(customId);
      expect(oid.id).toBe(customId);
    });

    it('should return id via toString', () => {
      const customId = '507f1f77bcf86cd799439011';
      const oid = new ObjectId(customId);
      expect(oid.toString()).toBe(customId);
    });

    it('should return id via toHexString', () => {
      const customId = '507f1f77bcf86cd799439011';
      const oid = new ObjectId(customId);
      expect(oid.toHexString()).toBe(customId);
    });
  });

  describe('BSON type classes', () => {
    it('should instantiate Binary', () => {
      expect(() => new Binary()).not.toThrow();
    });

    it('should instantiate Code', () => {
      expect(() => new Code()).not.toThrow();
    });

    it('should instantiate DBRef', () => {
      expect(() => new DBRef()).not.toThrow();
    });

    it('should instantiate Decimal128', () => {
      expect(() => new Decimal128()).not.toThrow();
    });

    it('should instantiate Double', () => {
      expect(() => new Double()).not.toThrow();
    });

    it('should instantiate Int32', () => {
      expect(() => new Int32()).not.toThrow();
    });

    it('should instantiate Long', () => {
      expect(() => new Long()).not.toThrow();
    });

    it('should instantiate MaxKey', () => {
      expect(() => new MaxKey()).not.toThrow();
    });

    it('should instantiate MinKey', () => {
      expect(() => new MinKey()).not.toThrow();
    });

    it('should instantiate Timestamp', () => {
      expect(() => new Timestamp()).not.toThrow();
    });

    it('should instantiate UUID', () => {
      expect(() => new UUID()).not.toThrow();
    });
  });

  describe('secp256k1', () => {
    it('should have CURVE property', () => {
      expect(secp256k1).toHaveProperty('CURVE');
    });

    it('should have CURVE.p as BigInt', () => {
      expect(secp256k1.CURVE.p).toBe(BigInt(0));
    });

    it('should have CURVE.n as BigInt', () => {
      expect(secp256k1.CURVE.n).toBe(BigInt(0));
    });
  });
});
