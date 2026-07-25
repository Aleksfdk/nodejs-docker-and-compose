import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface LoginResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findOneWithPassword(username);

      const isPasswordMatch = await bcrypt.compare(pass, user.password);
      if (isPasswordMatch) {
        return user;
      }
    } catch {
      // Если findOne выкинул NotFoundException, просто идем в Unauthorized
    }
    throw new UnauthorizedException('Неверное имя пользователя или пароль');
  }

  login(user: { username: string; id: number }): LoginResponse {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
