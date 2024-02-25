import { Injectable } from '@nestjs/common';
import { AuthMapper } from '../mapper/auth.mapper';
import { PrismaClient } from '@prisma/client';
import { UserSignUpDTO } from '../dtos/user.dto';
import { USER_BAD_REQUEST_ERRORS } from '../const/auth.constants';
import { AppError, AppResult, AuthService, QueryBuilder } from '@suryac72/api-core-services';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { queryMaps } from './query-map';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly mapper: AuthMapper,
    private readonly prisma: PrismaClient,
    private readonly authService: AuthService,
    private readonly queryBuilder: QueryBuilder
  ) {}
  async signup(
    userDetails: any,
  ): Promise<AppResult<UserSignUpDTO> | AppResult<AppError>> {
    try {
      const foundUser = await this.prisma.user_credentials.findUnique({
        where: {
          user_email: userDetails.email.value,
        },
      });

      if (foundUser) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.USER_ALREADY_EXISTS,
        });
      }

      const fieldMappedToPersistence =
        await this.mapper.toDomainFromPersistance(userDetails);

      const result = await this.prisma.$transaction([
        this.prisma.user_credentials.create({
          data: fieldMappedToPersistence,
        }),
      ]);

      const resultantObject = this.mapper.toDto(result[0]);
      return AppResult.ok(resultantObject);
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }

  async loginUser(
    loginCreds: any,
    request: Request,
    response: Response,
  ): Promise<
    AppResult<Response<any, Record<string, any>>> | AppResult<AppError>
  > {
    try {
      const foundUser = await this.prisma.user_credentials.findUnique({
        where: {
          user_email: loginCreds.email.value,
        },
      });

      if (!foundUser) {
        return AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }

      if (
        !this.comparePasswords(
          loginCreds.password.value,
          foundUser.user_password,
        )
      ) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.INVALID_PASSWORD,
        });
      }

      // Sign JWT and return to user
      const userDto = this.mapper.toDto(foundUser);
      const accessToken = await this.authService.signToken(userDto);

      if (!accessToken) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.TOKEN_NOT_FOUND,
        });
      }

      // Set cookie and send response
      response.cookie('talk-addictive', accessToken, {
        expires: new Date(Date.now() + 9999999),
        httpOnly: false,
        secure: true,
      });

      return AppResult.ok(
        response.send({ success: true, accessToken: accessToken }),
      );
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }

  async logOut(
    request: Request,
    response: Response,
  ): Promise<
    AppResult<Response<any, Record<string, any>>> | AppResult<AppError>
  > {
    try {
      await response.clearCookie('talk-addictive');
      return AppResult.ok(response.send({ success: true }));
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: 'INTERNAL_SERVER_ERROR' });
    }
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateUser(loginCreds: any) : Promise<AppResult<boolean> | AppResult<AppError>>{
    const foundUser = await this.prisma.user_credentials.findUnique({
      where: {
        user_email: loginCreds.email.value,
      },
    });

    if (!foundUser) {
      return AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
    }

    if (
      !this.comparePasswords(loginCreds.password.value, foundUser.user_password)
    ) {
      return AppResult.fail({
        code: USER_BAD_REQUEST_ERRORS.INVALID_PASSWORD,
      });
    }

    return AppResult.ok(true);
  }

  async findAllUsers(userDetails: any) : Promise<AppResult<AppError> | AppResult<UserSignUpDTO[]>> {
      const fieldMappedToPersistence = this.mapper.toFindAllPersistence(userDetails);
      const query = await this.queryBuilder.buildManyQuery(fieldMappedToPersistence,queryMaps,true);
      console.log(query);
      const result = await this.prisma.user_credentials.findMany({
        where: {
          ...query.where
        }
      })
      const fieldMappedToDTO = result.map((res) => {
        return this.mapper.toDto(res);
      })
      return AppResult.ok<UserSignUpDTO[]>(fieldMappedToDTO);
  }
}
