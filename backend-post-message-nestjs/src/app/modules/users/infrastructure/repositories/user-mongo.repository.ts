import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CryptoUtils } from '../../../../../app/core/utils/crypto.utils';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';
import { Role } from '../../roles/schemas/role.schema';

@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Post') private postModel: any,
    @InjectModel('Comment') private commentModel: any,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await CryptoUtils.hashPassword(
      createUserDto.password_hash,
    );
    const createdUser = new this.userModel({
      ...createUserDto,
      password_hash: hashedPassword,
    });
    return createdUser.save();
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).populate('role').exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    filters?: { role?: string; status?: string; email?: string }
  ): Promise<PaginatedResponse<User>> {
    const query: Record<string, unknown> = {};

    if (filters?.role) {
      const roleDoc = await this.roleModel.findOne({ name: filters.role }).exec();
      if (roleDoc) {
        query.role = roleDoc._id;
      } else {
        return { items: [], total: 0, skip, limit };
      }
    }

    if (filters?.status) {
      if (filters.status === 'active') {
        query.isActive = true;
      } else if (filters.status === 'inactive' || filters.status === 'suspended') {
        query.isActive = false;
      }
    }

    if (filters?.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).populate('role').exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      skip,
      limit,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updateLanguagePreference(
    id: string,
    language: 'en' | 'es',
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { preferredLanguage: language }, { new: true })
      .exec();
  }

  async assignRole(id: string, roleId: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { role: new Types.ObjectId(roleId) },
        { new: true },
      )
      .populate('role')
      .exec();
  }

  async changePassword(id: string, newPasswordHash: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { password_hash: newPasswordHash }, { new: true })
      .exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async activate(id: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();
  }

  async deactivate(id: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    posts: number;
    comments: number;
    growthPercentage: number;
  }> {
    const [total, active, verified, posts, comments] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ isActive: true }).exec(),
      this.userModel.countDocuments({ isVerified: true }).exec(),
      this.postModel.countDocuments({ isActive: true, isDeleted: false }).exec(),
      this.commentModel.countDocuments({ isActive: true, isDeleted: false }).exec(),
    ]);

    // Calculate growth percentage (active users growth)
    const growthPercentage = total > 0 ? ((active / total) * 100).toFixed(2) : 0;

    return {
      total,
      active,
      verified,
      posts,
      comments,
      growthPercentage: Number(growthPercentage)
    };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLoginAt: new Date() })
      .exec();
  }
}
