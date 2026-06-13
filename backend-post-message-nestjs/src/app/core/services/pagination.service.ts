import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class PaginationService {
  async paginate<T>(
    model: Model<T>,
    page: number = 1,
    limit: number = 10,
    query: Record<string, unknown> = {},
  ): Promise<{ data: T[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      (model.find(query) as any).skip(skip).limit(limit).exec(),
      (model.countDocuments(query) as any).exec(),
    ]);

    return {
      data,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
