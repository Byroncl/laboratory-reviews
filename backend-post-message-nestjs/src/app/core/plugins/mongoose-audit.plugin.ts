import { Schema, CallbackWithoutResultAndOptionalError } from 'mongoose';

export function auditPlugin(schema: Schema): void {
  schema.pre('save', function (this: Record<string, unknown> & { isNew: boolean }, next: CallbackWithoutResultAndOptionalError) {
    if (this.isNew) {
      this['createdAt'] = new Date();
    }
    this['updatedAt'] = new Date();
    next();
  });

  schema.pre('findOneAndUpdate', function (this: { set: (data: Record<string, unknown>) => void }, next: CallbackWithoutResultAndOptionalError) {
    this.set({ updatedAt: new Date() });
    next();
  });
}
