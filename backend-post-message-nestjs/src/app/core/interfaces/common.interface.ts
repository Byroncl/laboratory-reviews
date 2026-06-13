export interface BaseEntity {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IsActiveEntity extends BaseEntity {
  isActive: boolean;
}

export interface Identifiable {
  id: string;
}
