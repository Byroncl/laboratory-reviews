import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../schemas/permission.schema';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const identifier = createPermissionDto.name
      .toLowerCase()
      .replace(/ /g, '-');
    const createdPermission = new this.permissionModel({
      ...createPermissionDto,
      identifier,
    });
    return createdPermission.save();
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }
}
