import { auditPlugin } from './mongoose-audit.plugin';
import { Schema } from 'mongoose';

describe('auditPlugin', () => {
  it('should register a pre-save hook on the schema', () => {
    const schema = new Schema({});
    const preSpy = jest.spyOn(schema, 'pre');

    auditPlugin(schema);

    expect(preSpy).toHaveBeenCalledWith('save', expect.any(Function));
  });

  it('should register a pre-findOneAndUpdate hook on the schema', () => {
    const schema = new Schema({});
    const preSpy = jest.spyOn(schema, 'pre');

    auditPlugin(schema);

    expect(preSpy).toHaveBeenCalledWith('findOneAndUpdate', expect.any(Function));
  });

  it('pre-save hook should set createdAt on new documents', () => {
    const schema = new Schema({});
    const hooks: Record<string, Function> = {};

    jest.spyOn(schema, 'pre').mockImplementation((event: any, fn: any) => {
      hooks[event as string] = fn;
      return schema;
    });

    auditPlugin(schema);

    const doc: any = { isNew: true };
    const next = jest.fn();
    hooks['save'].call(doc, next);

    expect(doc.createdAt).toBeInstanceOf(Date);
    expect(doc.updatedAt).toBeInstanceOf(Date);
    expect(next).toHaveBeenCalled();
  });

  it('pre-save hook should NOT overwrite createdAt on existing documents', () => {
    const schema = new Schema({});
    const hooks: Record<string, Function> = {};

    jest.spyOn(schema, 'pre').mockImplementation((event: any, fn: any) => {
      hooks[event as string] = fn;
      return schema;
    });

    auditPlugin(schema);

    const originalCreatedAt = new Date('2020-01-01');
    const doc: any = { isNew: false, createdAt: originalCreatedAt };
    const next = jest.fn();
    hooks['save'].call(doc, next);

    expect(doc.createdAt).toBe(originalCreatedAt);
    expect(doc.updatedAt).toBeInstanceOf(Date);
  });

  it('pre-findOneAndUpdate hook should call this.set with updatedAt', () => {
    const schema = new Schema({});
    const hooks: Record<string, Function> = {};

    jest.spyOn(schema, 'pre').mockImplementation((event: any, fn: any) => {
      hooks[event as string] = fn;
      return schema;
    });

    auditPlugin(schema);

    const setMock = jest.fn();
    const next = jest.fn();
    hooks['findOneAndUpdate'].call({ set: setMock }, next);

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: expect.any(Date) }),
    );
    expect(next).toHaveBeenCalled();
  });
});
