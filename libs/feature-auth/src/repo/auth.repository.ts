import { Injectable } from '@nestjs/common';
import { AuthMapper } from '../mapper/auth.mapper';
import { PrismaClient } from '@prisma/client';
import { UserSignUpDTO } from '../dtos/user.dto';
import { USER_BAD_REQUEST_ERRORS } from '../const/auth.constants';
import { AppError, AppResult, AuthService } from '@suryac72/api-core-services';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly mapper: AuthMapper,
    private readonly prisma: PrismaClient,
    private readonly authService: AuthService,
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

      //sign jwt and return to user
      const userDto = this.mapper.toDto(foundUser);

      const token = await this.authService.signToken(userDto);

      if (!token) {
        AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.TOKEN_NOT_FOUND });
      }
      await response
        .cookie('talk-addictive', token, {
          expires: new Date(Date.now() + 9999999),
          httpOnly: false,
          secure: true,
        })
        .send({ userDto, token: token });
      return AppResult.ok(response.send({ success: true }));
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
}
