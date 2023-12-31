import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RESPONSE_MESSAGES, Role, User } from '@core/core';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthUtilsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async verifyJwt(jwt: string): Promise<any> {
    if (!jwt) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: RESPONSE_MESSAGES.userUnauthorized,
      });
    }

    try {
      return await this.jwtService.verifyAsync(jwt, { secret: this.configService.get('JWT_SECRET') });
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: RESPONSE_MESSAGES.userUnauthorized,
      });
    }
  }

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
    roles
  }: {
    id: number;
    email: string;
    roles: Role[];
  }): Promise<string[]> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          user: {
            id,
            email,
            roles
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
