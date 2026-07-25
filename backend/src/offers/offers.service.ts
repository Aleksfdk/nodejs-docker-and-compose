import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(data: CreateOfferDto & { userId: number }): Promise<Offer> {
    const { itemId, userId, ...offerData } = data;

    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: { owner: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === userId) {
      throw new ForbiddenException('Нельзя скидываться на собственный подарок');
    }

    if (wish.raised + offerData.amount > wish.price) {
      throw new BadRequestException(
        'Сумма взносов превышает стоимость подарка',
      );
    }

    wish.raised += offerData.amount;

    await this.wishRepository.save(wish);

    const offer = this.offerRepository.create({
      ...offerData,
      item: { id: itemId },
      user: { id: userId },
    });

    return await this.offerRepository.save(offer);
  }

  async findOne(query: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: query,
      relations: { item: true, user: true },
    });

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }
    return offer;
  }

  async findMany(query: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return await this.offerRepository.find({
      where: query,
      relations: { item: true, user: true },
    });
  }
}

export default OffersService;
