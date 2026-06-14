import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientUseCaseFactory } from '../application/use-cases/client.use-cases';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ClientOrAdminGuard } from '../guards/client-or-admin.guard';

describe('ClientsController', () => {
  let controller: ClientsController;
  let mockUseCase: jest.Mocked<ClientUseCaseFactory>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockClient = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Acme Corp',
    email: 'acme@example.com',
  } as any;

  beforeEach(async () => {
    mockUseCase = {
      createClient: jest.fn(),
      getAllClients: jest.fn(),
      getClientById: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
    } as any;

    mockI18n = {
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientUseCaseFactory, useValue: mockUseCase },
        { provide: I18nService, useValue: mockI18n },
        { provide: ClientOrAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client and return wrapped response', async () => {
      const dto: CreateClientDto = { name: 'Acme Corp', email: 'acme@example.com' } as any;
      mockUseCase.createClient.mockResolvedValue(mockClient);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockClient);
      expect(mockUseCase.createClient).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      mockUseCase.getAllClients.mockResolvedValue([mockClient]);

      const response = await controller.findAll();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockClient]);
    });

    it('should return empty array when no clients', async () => {
      mockUseCase.getAllClients.mockResolvedValue([]);

      const response = await controller.findAll();

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return client by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockUseCase.getClientById.mockResolvedValue(mockClient);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockClient);
      expect(mockUseCase.getClientById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when client not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockUseCase.getClientById.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdateClientDto = { name: 'Updated Corp' } as any;
      const updated = { ...mockClient, name: 'Updated Corp' };
      mockUseCase.updateClient.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockUseCase.updateClient).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a client and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockUseCase.deleteClient.mockResolvedValue(mockClient);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockUseCase.deleteClient).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
