import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Wish } from '../wishes/entities/wish.entity';
import { PublicUserDto } from './dto/public-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким именем или email уже существует',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const userResponse = new User();

    userResponse.id = savedUser.id;
    userResponse.username = savedUser.username;
    userResponse.email = savedUser.email;
    userResponse.createdAt = savedUser.createdAt;
    userResponse.updatedAt = savedUser.updatedAt;
    return userResponse;
  }

  async findOne(query: FindOptionsWhere<User>): Promise<PublicUserDto> {
    const user = await this.userRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      id: user.id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
    };
  }

  async findOneWithPassword(username: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password')
      .getOne();
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(query);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = this.userRepository.create({
      ...user,
      ...updateUserDto,
    });

    const savedUser = await this.userRepository.save(updatedUser);

    const userResponse = new User();

    userResponse.id = savedUser.id;
    userResponse.username = savedUser.username;
    userResponse.email = savedUser.email;
    userResponse.createdAt = savedUser.createdAt;
    userResponse.updatedAt = savedUser.updatedAt;
    return userResponse;
  }

  async removeOne(query: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOne(query);
    await this.userRepository.delete(user.id);
  }

  async getMyWishes(query: FindOptionsWhere<User>): Promise<Wish[]> {
    const user = await this.userRepository.findOne({
      where: query,
      relations: {
        wishes: {
          owner: true,
          offers: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes;
  }

  async findUsers(query: string): Promise<User[]> {
    return await this.userRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });
  }
}
