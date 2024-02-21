import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SignupDTO } from './use-cases/signup-user/signup-user.dto';
import { UserSignupUseCase } from './use-cases/signup-user/signup-user.use-case';
import {
  ApiResponse,
  AppError,
  AppResult,
  UserSignUpDTO,
} from '@suryac72/api-core-services';
import { LoginDTO } from './use-cases/login-user/login-user.dto';
import { UserLoginUseCase } from './use-cases/login-user/login-user.use-case';
import { Response } from 'express';
import { UserLogoutUseCase } from './use-cases/signout-user/signout-user.use-case';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly userSignupUseCase: UserSignupUseCase,
    private readonly userLoginUseCase: UserLoginUseCase,
    private readonly userLogoutUseCase: UserLogoutUseCase,
    private readonly jwtService: JwtService
  ) {}

  @Post('/signup')
  async signup(
    @Body() requestBody: SignupDTO,
  ): Promise<ApiResponse<UserSignUpDTO, unknown> | AppError> {
    const result = await this.userSignupUseCase.execute({ body: requestBody });
    if (AppResult.isInvalid(result)) {
      return result.getError();
    }
    return result.getValue();
  }

  @Post('/authenticate')
  async authenticate(
    @Body() requestBody: LoginDTO,
    @Req() req,
    @Res() res,
  ): Promise<
    ApiResponse<Response<any, Record<string, any>>, unknown> | AppError
  > {
    const result = await this.userLoginUseCase.execute({
      body: requestBody,
      request: req,
      response: res,
    });
    if (AppResult.isInvalid(result)) {
      return result.getError();
    }
    return result.getValue();
  }

  @Post('/logout')
  async logout(
    @Req() req,
    @Res() res,
  ): Promise<
    ApiResponse<Response<any, Record<string, any>>, unknown> | AppError
  > {
    const result = await this.userLogoutUseCase.execute({
      request: req,
      response: res,
    });
    if (AppResult.isInvalid(result)) {
      return result.getError();
    }
    return result.getValue();
  }
}
