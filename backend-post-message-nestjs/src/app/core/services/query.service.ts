import { Injectable } from '@nestjs/common';

type MongoOperator =
  | { $gt: unknown }
  | { $gte: unknown }
  | { $lt: unknown }
  | { $lte: unknown }
  | { $regex: unknown; $options: string }
  | { $in: unknown[] };

type QueryObject = Record<string, unknown | MongoOperator>;

@Injectable()
export class QueryService {
  buildQuery(filters: Record<string, unknown>): QueryObject {
    const query: QueryObject = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      if (key.includes('__')) {
        const separatorIndex = key.indexOf('__');
        const field = key.slice(0, separatorIndex);
        const operator = key.slice(separatorIndex + 2);

        switch (operator) {
          case 'gt':
            query[field] = { $gt: value };
            break;
          case 'gte':
            query[field] = { $gte: value };
            break;
          case 'lt':
            query[field] = { $lt: value };
            break;
          case 'lte':
            query[field] = { $lte: value };
            break;
          case 'contains':
            query[field] = { $regex: value, $options: 'i' };
            break;
          case 'in':
            query[field] = { $in: Array.isArray(value) ? value : [value] };
            break;
          default:
            query[key] = value;
        }
      } else {
        query[key] = value;
      }
    }

    return query;
  }
}
