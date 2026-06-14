import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role } from '../../schemas/role.schema';
import { CreateRoleDto } from '../../dto/create-role.dto';
import { UpdateRoleDto } from '../../dto/update-role.dto';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Concrete implementation of RoleRepository using MongoDB.
 * Handles all role-specific data access operations including permission management.
 */
@Injectable()
export class RoleMongoRepository implements RoleRepository {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly i18nService: I18nService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Generate identifier from role name (lowercase with hyphens)
    const identifier = createRoleDto.name
      .toLowerCase()
      .replace(/ /g, '-');

    const createdRole = new this.roleModel({
      ...createRoleDto,
      identifier,
    });

    return createdRole.save();
  }

  async findAll(name?: string): Promise<Role[]> {
    // Build filter: case-insensitive name search if provided
    const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
    return this.roleModel
      .find(filter)
      .populate('permissions')
      .exec();
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleModel
      .findById(id)
      .populate('permissions')
      .exec();
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role | null> {
    return this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Role | null> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    // Convert string IDs to MongoDB ObjectIds
    const objectIds = permissionIds.map((id) => new Types.ObjectId(id));

    const updated = await this.roleModel
      .findByIdAndUpdate(
        roleId,
        { permissions: objectIds },
        { new: true },
      )
      .populate('permissions')
      .exec();

    if (!updated) {
      throw new NotFoundException(
        this.i18nService.translate('roles.not_found'),
      );
    }

    return updated;
  }

  async hasPermission(
    roleId: string,
    permissionIdentifier: string,
  ): Promise<boolean> {
    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions')
      .exec();

    if (!role) {
      return false;
    }

    const perms = role.permissions as any[];
    return perms.some((p) => p.identifier === permissionIdentifier);
  }

  async hasAllPermissions(
    roleId: string,
    permissionIdentifiers: string[],
  ): Promise<boolean> {
    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions')
      .exec();

    if (!role) {
      return false;
    }

    const perms = role.permissions as any[];
    return permissionIdentifiers.every((id) =>
      perms.some((p) => p.identifier === id),
    );
  }
}
