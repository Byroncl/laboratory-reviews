export interface IClient {
  _id?: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  password_hash: string;
  type: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClientRepository {
  create(client: IClient): Promise<IClient>;
  findById(id: string): Promise<IClient | null>;
  findByEmail(email: string): Promise<IClient | null>;
  findByUsername(username: string): Promise<IClient | null>;
  findAll(): Promise<IClient[]>;
  update(id: string, client: Partial<IClient>): Promise<IClient | null>;
  delete(id: string): Promise<void>;
}

export interface IClientUseCase {
  createClient(data: Omit<IClient, '_id' | 'createdAt' | 'updatedAt'>): Promise<IClient>;
  getClientById(id: string): Promise<IClient | null>;
  getClientByEmail(email: string): Promise<IClient | null>;
  getClientByUsername(username: string): Promise<IClient | null>;
  getAllClients(): Promise<IClient[]>;
  updateClient(id: string, data: Partial<IClient>): Promise<IClient | null>;
  deleteClient(id: string): Promise<void>;
}
