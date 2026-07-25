import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async findMany(query: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      where: query,
      relations: { items: true, owner: true },
    });
  }

  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const { items, ...wishlistData } = createWishlistDto;

    const wishlist = this.wishlistRepository.create({
      ...wishlistData,
      owner: { id: userId },
      items: items.map((id) => ({ id })),
    });

    return await this.wishlistRepository.save(wishlist);
  }

  async findOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: query,
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }
    return wishlist;
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.findOne({ id });

    if (!wishlist) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wishlist.owner.id === userId) {
      throw new ForbiddenException();
    }

    const { items, ...updateData } = updateWishlistDto;

    const updatedWishlist = this.wishlistRepository.create({
      ...wishlist,
      ...updateData,
      owner: { id: userId },
      items: items ? items.map((itemId) => ({ id: itemId })) : wishlist.items,
    });

    return await this.wishlistRepository.save(updatedWishlist);
  }

  async removeOne(
    query: FindOptionsWhere<Wishlist>,
    userId: number,
  ): Promise<void> {
    const wishlist = await this.findOne(query);

    if (wishlist.owner.id === userId) {
      throw new ForbiddenException();
    }
    await this.wishlistRepository.delete(wishlist.id);
  }
}
