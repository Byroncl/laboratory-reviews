import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClientsService } from './clients.service';
import { Client } from '../schemas/client.schema';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockClientModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockClientModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockClientModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockClientModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockClientModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockClient = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Acme Corp',
    email: 'acme@example.com',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getModelToken(Client.name), useValue: MockClientModel },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a client', async () => {
      const dto: CreateClientDto = { name: 'Acme Corp', email: 'acme@example.com' } as any;
      mockSave.mockResolvedValue(mockClient);

      const result = await service.create(dto);

      expect(result).toEqual(mockClient);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Duplicate email'));

      await expect(service.create({} as any)).rejects.toThrow('Duplicate email');
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      mockExec.mockResolvedValue([mockClient]);

      const result = await service.findAll();

      expect(result).toEqual([mockClient]);
    });

    it('should return empty array when no clients', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return client by id', async () => {
      mockExec.mockResolvedValue(mockClient);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockClient);
      expect(MockClientModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when client not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const dto: UpdateClientDto = { name: 'Updated Corp' } as any;
      const updated = { ...mockClient, name: 'Updated Corp' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockClientModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when client not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      mockExec.mockResolvedValue(mockClient);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockClient);
      expect(MockClientModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when client not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });
});
