import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const identifier = createRoleDto.name.toLowerCase().replace(/ /g, '-');
    const createdRole = new this.roleModel({
      ...createRoleDto,
      identifier,
    });
    return createdRole.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleModel.findById(id).populate('permissions').exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    return this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Role | null> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const objectIds = permissionIds.map(id => new Types.ObjectId(id));
    const updated = await this.roleModel
      .findByIdAndUpdate(
        roleId,
        { permissions: objectIds },
        { new: true },
      )
      .populate('permissions')
      .exec();

    if (!updated) {
      throw new NotFoundException('Role not found');
    }
    return updated;
  }

  async hasPermission(roleId: string, permissionIdentifier: string): Promise<boolean> {
    const role = await this.roleModel.findById(roleId).populate('permissions').exec();
    if (!role) return false;
    const perms = role.permissions as any[];
    return perms.some(p => p.identifier === permissionIdentifier);
  }

  async hasAllPermissions(roleId: string, permissionIdentifiers: string[]): Promise<boolean> {
    const role = await this.roleModel.findById(roleId).populate('permissions').exec();
    if (!role) return false;
    const perms = role.permissions as any[];
    return permissionIdentifiers.every(id => perms.some(p => p.identifier === id));
  }
}
