import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PublicWishDto } from './dto/public-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: { id: userId },
    });

    return await this.wishRepository.save(wish);
  }

  async findOne(query: FindOptionsWhere<Wish>): Promise<PublicWishDto> {
    const wish = await this.wishRepository.findOne({
      where: query,
      relations: { owner: true, offers: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return {
      id: wish.id,
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: wish.owner,
      raised: wish.raised,
      copied: wish.copied,
    };
  }

  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findOne(query);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException();
    }

    if (wish.raised > 0 && updateWishDto.price) {
      throw new BadRequestException();
    }

    const createdWish = this.wishRepository.create({
      ...wish,
      ...updateWishDto,
      owner: { id: userId },
    });

    return await this.wishRepository.save(createdWish);
  }

  async removeOne(
    query: FindOptionsWhere<Wish>,
    userId: number,
  ): Promise<void> {
    const wish = await this.findOne(query);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException();
    }

    await this.wishRepository.delete(wish.id);
  }

  async findLast(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      relations: { owner: true, offers: true },
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: { owner: true, offers: true },
    });
  }

  async copyWish(wishId: number, userId: number): Promise<Wish> {
    const originalWish = await this.findOne({ id: wishId });

    originalWish.copied += 1;
    await this.wishRepository.save(originalWish);

    const clonedWish = this.wishRepository.create({
      name: originalWish.name,
      link: originalWish.link,
      image: originalWish.image,
      price: originalWish.price,
      description: originalWish.description,
      owner: { id: userId },
      raised: 0,
      copied: 0,
    });

    return this.wishRepository.save(clonedWish);
  }
}
