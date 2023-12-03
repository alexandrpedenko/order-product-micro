import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { RESPONSE_MESSAGES, Role, User } from '@core/core';

import { AuthResponseDto } from '../dto/response';
import { LogInUserDto, CreateUserDto } from '../dto/request';
import { AuthUtilsService } from './auth-utils.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authUtilsService: AuthUtilsService,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // TODO: !!! Move to separate USER repository !!!
  async getUserFromDb(id: number) {
    return await this.usersRepository.createQueryBuilder('user')
      .select(['user.id', 'user.username'])
      .where('user.id = :userId', { userId: id })
      .leftJoinAndSelect('user.roles', 'roles')
      .getOne();
  }

  // NOTE: For testing purpose
  async getUser(id: number) {
    const user = await this.getUserFromDb(id);

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  // NOTE: For microservices testing purpose
  async getUserForAnotherService(id: number) {
    const user = await this.getUserFromDb(id);

    if (!user) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: RESPONSE_MESSAGES.userNotFound,
      });
    }

    return user;
  }

  public async registerUser(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const isUserExists = await this.authUtilsService.isUserExists(createUserDto.email);

    if (isUserExists) {
      throw new HttpException(
        RESPONSE_MESSAGES.userAlreadyRegistered,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await this.authUtilsService.hashPassword(createUserDto.password);
    const created = this.usersRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      roles: createUserDto.roles?.map((roleDto) => new Role(roleDto)),
    });

    await this.usersRepository.save(created);

    return { message: RESPONSE_MESSAGES.userRegistered };
  }

  public async login(userPayload: LogInUserDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.password'])
      .where('user.email = :email', { email: userPayload.email })
      .leftJoinAndSelect('user.roles', 'roles')
      .getOne();

    if (user === null) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { id, email, password, roles } = user;
    const isPasswordValid = await this.authUtilsService.comparePasswords(
      userPayload.password,
      password,
    );

    if (isPasswordValid) {
      const [accessToken, refreshToken] = await this.authUtilsService.generateJwt({
        id,
        email,
        roles
      });

      return {
        refreshToken,
        accessToken,
      };
    }

    throw new HttpException(
      RESPONSE_MESSAGES.invalidUserCredentials,
      HttpStatus.BAD_REQUEST,
    );
  }

  // TODO: Think of logout
  public async logout(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({
      id,
    });

    if (user === null) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { message: 'User successfully logged out' };
  }

  public async regenerateRefreshToken(
    id: number,
    oldRefreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.getUserFromDb(id);
    if (user === null) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { email, roles } = user;

    // TODO: Validate Old Refresh token
    if (!oldRefreshToken) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [accessToken, newRefreshToken] = await this.authUtilsService.generateJwt({
      email,
      id,
      roles
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
