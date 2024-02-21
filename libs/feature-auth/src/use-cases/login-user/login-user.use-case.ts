import { Injectable } from '@nestjs/common';
import { USER_BAD_REQUEST_ERRORS } from '../../const/auth.constants';
import { AuthRepository } from '@app/feature-auth/repo/auth.repository';
import { LoginResponse } from '@app/feature-auth/dtos/user.dto';
import { LOGIN_DOMAIN } from '@app/feature-auth/domains/auth.domain';
import { ApiResponse, AppError, AppResult, DomainService, UseCase } from '@suryac72/api-core-services';
import { LoginDTO } from './login-user.dto';
import { Request,Response } from 'express';


type UserLoginRequest = {
  body: LoginDTO;
  request: Request,
  response: Response
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<Response<any, Record<string, any>>, unknown>>;

@Injectable()
export class UserLoginUseCase implements UseCase<UserLoginRequest, ResponseBody> {
  constructor(
    private authRepository: AuthRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(requestObj: UserLoginRequest): Promise<ResponseBody> {
    try {
      const { body,request,response } = requestObj;
      if (Object.values(body).length <= 0) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.INVALID_USER_BODY,
        });
      }

      const loginDomain = this.domainService.validateAndCreateDomain(
        LOGIN_DOMAIN,
        body,
      );
      if (AppResult.isInvalid(loginDomain)) {
        return loginDomain;
      }
      const loginUser = await this.authRepository.loginUser(
        loginDomain.getValue(),
        request,
        response
      );
      if (AppResult.isInvalid(loginUser)) {
        return loginUser;
      }
      return AppResult.ok<ApiResponse<Response<any, Record<string, any>>, unknown>>({ data: loginUser.getValue() });
    } catch (e) {
      console.log(e);
      return AppResult.fail({code: 'USER_UNEXPECTED_ERROR'})
    }
  }
}
