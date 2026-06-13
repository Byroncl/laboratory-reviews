import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }
}
