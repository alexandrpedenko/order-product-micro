import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '@core/core';

@Injectable()
export class AuthUtilsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async validateUserAndReturnIt(token: string): Promise<User | null> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token, { secret: this.configService.get('JWT_SECRET') });
      const user = await this.usersRepository.findOneBy({ id: decodedToken.user.id });

      if (user) {
        return user;
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  public async isUserExists(email: string): Promise<boolean> {
    const existedUser = await this.usersRepository.findOneBy({ email });

    if (existedUser === null) {
      return false;
    }
    return true;
  }

  public async generateJwt({
    id,
    email,
  }: {
    id: number;
    email: string;
  }): Promise<string[]> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          user: {
            id,
            email,
          },
        },
        { secret: this.configService.get('JWT_SECRET'), expiresIn: '10m' },
      ),

      this.jwtService.signAsync(
        {
          user: {
            id,
            email,
          },
        },
        {
          secret: this.configService.get('JWT_REFRESH'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return [accessToken, refreshToken];
  }

  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  public async comparePasswords(
    inputPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}
