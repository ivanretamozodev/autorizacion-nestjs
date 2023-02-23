import { User } from './entities/user.entity';
import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const emailExist = await this.userModel.find({ email });
    if (emailExist) throw new HttpException('EMAIL_ALREADY_USED', 403);
    const user = await this.userModel.create(createUserDto);
    await user.save();
    return user;
  }

  async findAll() {
    const users = await this.userModel.find({});
    return users;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    return user;
  }

  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id);
    return `user with id${id} is deleted`;
  }
}
