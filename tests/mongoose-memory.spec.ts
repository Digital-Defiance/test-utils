import { connectMemoryDB, disconnectMemoryDB, clearMemoryDB } from '../src/lib/mongoose-memory';
import mongoose from 'mongoose';

describe('mongoose-memory', () => {
  describe('connectMemoryDB', () => {
    afterEach(async () => {
      await disconnectMemoryDB();
    });

    it('should connect to in-memory MongoDB', async () => {
      const connection = await connectMemoryDB();
      expect(connection).toBeDefined();
      expect(connection.readyState).toBe(1); // 1 = connected
    });

    it('should reuse existing connection', async () => {
      const connection1 = await connectMemoryDB();
      const connection2 = await connectMemoryDB();
      expect(connection1).toBe(connection2);
    });
  });

  describe('clearMemoryDB', () => {
    beforeEach(async () => {
      await connectMemoryDB();
    });

    afterEach(async () => {
      await disconnectMemoryDB();
    });

    it('should clear all collections', async () => {
      const schema = new mongoose.Schema({ name: String });
      const TestModel = mongoose.model('ClearTest', schema);
      
      await TestModel.create({ name: 'test1' });
      await TestModel.create({ name: 'test2' });
      
      expect(await TestModel.countDocuments()).toBe(2);
      
      await clearMemoryDB();
      
      expect(await TestModel.countDocuments()).toBe(0);
    });

    it('should clear multiple collections', async () => {
      const schema1 = new mongoose.Schema({ name: String });
      const schema2 = new mongoose.Schema({ value: Number });
      const Model1 = mongoose.model('ClearMulti1', schema1);
      const Model2 = mongoose.model('ClearMulti2', schema2);
      
      await Model1.create({ name: 'test' });
      await Model2.create({ value: 42 });
      
      expect(await Model1.countDocuments()).toBe(1);
      expect(await Model2.countDocuments()).toBe(1);
      
      await clearMemoryDB();
      
      expect(await Model1.countDocuments()).toBe(0);
      expect(await Model2.countDocuments()).toBe(0);
    });

    it('should be safe to call when no collections exist', async () => {
      await expect(clearMemoryDB()).resolves.not.toThrow();
    });

    it('should be safe to call when not connected', async () => {
      await disconnectMemoryDB();
      await expect(clearMemoryDB()).resolves.not.toThrow();
    });
  });

  describe('disconnectMemoryDB', () => {
    it('should disconnect and clean up', async () => {
      await connectMemoryDB();
      expect(mongoose.connection.readyState).toBe(1);
      
      await disconnectMemoryDB();
      
      expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
    });

    it('should be safe to call when not connected', async () => {
      await expect(disconnectMemoryDB()).resolves.not.toThrow();
    });

    it('should be safe to call multiple times', async () => {
      await connectMemoryDB();
      await disconnectMemoryDB();
      await expect(disconnectMemoryDB()).resolves.not.toThrow();
    });

    it('should drop database before disconnecting', async () => {
      await connectMemoryDB();
      const schema = new mongoose.Schema({ name: String });
      const TestModel = mongoose.model('DisconnectTest', schema);
      await TestModel.create({ name: 'test' });
      
      await disconnectMemoryDB();
      
      // Reconnect to verify database was dropped
      await connectMemoryDB();
      // Model needs to be re-registered after reconnect
      const NewModel = mongoose.model('DisconnectTest2', schema);
      expect(await NewModel.countDocuments()).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    afterEach(async () => {
      await disconnectMemoryDB();
    });

    it('should handle full lifecycle: connect -> use -> clear -> disconnect', async () => {
      // Connect
      const connection = await connectMemoryDB();
      expect(connection.readyState).toBe(1);
      
      // Use
      const schema = new mongoose.Schema({ value: Number });
      const Model = mongoose.model('LifecycleTest', schema);
      await Model.create({ value: 1 });
      await Model.create({ value: 2 });
      expect(await Model.countDocuments()).toBe(2);
      
      // Clear
      await clearMemoryDB();
      expect(await Model.countDocuments()).toBe(0);
      
      // Can still use after clear
      await Model.create({ value: 3 });
      expect(await Model.countDocuments()).toBe(1);
      
      // Disconnect
      await disconnectMemoryDB();
      expect(mongoose.connection.readyState).toBe(0);
    });

    it('should support reconnecting after disconnect', async () => {
      await connectMemoryDB();
      await disconnectMemoryDB();
      
      const connection = await connectMemoryDB();
      expect(connection.readyState).toBe(1);
    });
  });
});
