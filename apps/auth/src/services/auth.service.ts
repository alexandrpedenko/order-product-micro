import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

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
  ) {}

  getUser(id: number) {
    return this.usersRepository.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.roles', 'roles')
      .getOne();
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
    const user = await this.usersRepository.findOneBy({
      email: userPayload.email,
    });

    if (user === null) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.BAD_REQUEST,
      );
    }
    const { id, email, username, password } = user;
    const isPasswordValid = await this.authUtilsService.comparePasswords(
      userPayload.password,
      password,
    );

    if (isPasswordValid) {
      const [accessToken, refreshToken] = await this.authUtilsService.generateJwt({
        id,
        email,
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
    const user = await this.usersRepository.findOneBy({ id });
    if (user === null) {
      throw new HttpException(
        RESPONSE_MESSAGES.invalidUserCredentials,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { email } = user;

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
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
