import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CryptoUtils } from '../../../../../app/core/utils/crypto.utils';

@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    return this.userModel.findOne({ username }).exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
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
}
