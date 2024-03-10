import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { FindAllUserQuery } from './use-cases/find-all-users/find-all-users.dto';
import { FindAllUsersUseCase } from './use-cases/find-all-users/find-all-users.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userSignupUseCase: UserSignupUseCase,
    private readonly userLoginUseCase: UserLoginUseCase,
    private readonly userLogoutUseCase: UserLogoutUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly loggerService: Logger,
  ) {}

  @Post('/signup')
  async signup(
    @Body() requestBody: SignupDTO,
  ): Promise<ApiResponse<UserSignUpDTO, unknown> | AppError> {
    this.loggerService.log(
      'Executing userSignupUseCase',
      'signup-user.use-case.ts',
    );
    const result = await this.userSignupUseCase.execute({ body: requestBody });
    if (AppResult.isInvalid(result)) {
      this.loggerService.error(
        'Error in use-case Response of userSignupUseCase:',
        result.getError(),
      );
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
    this.loggerService.log(
      'Executing userLoginUseCase',
      'login-user.use-case.ts',
    );
    const result = await this.userLoginUseCase.execute({
      body: requestBody,
      request: req,
      response: res,
    });
    if (AppResult.isInvalid(result)) {
      this.loggerService.error(
        'Error in use-case Response of userLoginUseCase:',
        result.getError(),
      );
      return res.send(result.getError());
    }
    return res.send(result.getValue());
  }

  @Post('/logout')
  async logout(
    @Req() req,
    @Res() res,
  ): Promise<
    ApiResponse<Response<any, Record<string, any>>, unknown> | AppError
  > {
    this.loggerService.log(
      'Executing userLogoutUseCase',
      'signout-user.use-case.ts',
    );
    const result = await this.userLogoutUseCase.execute({
      request: req,
      response: res,
    });
    if (AppResult.isInvalid(result)) {
      this.loggerService.error(
        'Error in use-case Response of userLogoutUseCase:',
        result.getError(),
      );
      return result.getError();
    }
    return result.getValue();
  }

  @Get('/all')
  async findAllUsers(
    @Query() query: FindAllUserQuery,
  ): Promise<ApiResponse<UserSignUpDTO[], unknown> | AppError> {
    this.loggerService.log(
      'Executing findAllUsersUseCase',
      'find-all-users.use-case.ts',
    );
    const result = await this.findAllUsersUseCase.execute({ query });
    if (AppResult.isInvalid(result)) {
      this.loggerService.error(
        'Error in use-case Response of findAllUsersUseCase:',
        result.getError(),
      );
      return result.getError();
    }
    return result.getValue();
  }
}
