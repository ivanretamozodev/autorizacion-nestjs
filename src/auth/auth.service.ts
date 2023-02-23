import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginAuthDto } from './dtos/login-auth.dto';
import { RegisterAuthDto } from './dtos/register-auth.dto';
import { User, UserDocument } from './../users/schemas/user.schema';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  async register(userObject: RegisterAuthDto) {
    const { password } = userObject;
    const passwordHash = await hash(password, 10);
    userObject = { ...userObject, password: passwordHash };
    return this.userModel.create(userObject);
  }
  async login(userObject: LoginAuthDto) {
    const { email, password } = userObject;
    const userExist = await this.userModel.findOne({ email });
    if (!userExist) throw new HttpException('USER_NOT_FOUND', 403);

    const checkPassword = await compare(password, userExist.password);

    if (!checkPassword) throw new HttpException('WRONG_PASSWORD', 403);

    const payload = { id: userExist.id, name: userExist.name };
    const token = this.jwtService.sign(payload);

    const data = {
      user: userExist,
      token,
    };
    return data;
  }
}
