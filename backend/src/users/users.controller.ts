import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser {
  user: {
    id: number;
    username: string;
  };
}

interface UserFindDto {
  query: string;
}

@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return await this.usersService.findOne({ id: req.user.id });
  }

  @Patch('me')
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateOne(
      { id: req.user.id },
      updateUserDto,
    );
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return await this.usersService.findOne({ username });
  }

  @Get('me/wishes')
  async getMyWishes(@Req() req: RequestWithUser) {
    return await this.usersService.getMyWishes({ id: req.user.id });
  }

  @Get(':username/wishes')
  async getUsernameWishes(@Param('username') username: string) {
    return await this.usersService.getMyWishes({ username });
  }

  @Post('find')
  async findUsers(@Body() query: UserFindDto) {
    return await this.usersService.findUsers(query.query);
  }
}
