import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../types/request';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('wishes')
@UseGuards(JwtAuthGuard)
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.updateOne({ id }, updateWishDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.wishesService.removeOne({ id }, req.user.id);
  }

  @Get('top')
  getTop() {
    return this.wishesService.findTop();
  }

  @Get('last')
  getLast() {
    return this.wishesService.findLast();
  }

  @Post(':id/copy')
  getCopy(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.wishesService.copyWish(id, req.user.id);
  }
}
