import { Injectable } from '@nestjs/common';
import { AuthRepository } from '@app/feature-auth/repo/auth.repository';
import { ApiResponse, AppError, AppResult, UseCase } from '@suryac72/api-core-services';
import { Request,Response } from 'express';


type UserLoginRequest = {
  request: Request,
  response: Response
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<Response<any, Record<string, any>>, unknown>>;

@Injectable()
export class UserLogoutUseCase implements UseCase<UserLoginRequest, ResponseBody> {
  constructor(
    private authRepository: AuthRepository,
  ) {}

  async execute(requestObj: UserLoginRequest): Promise<ResponseBody> {
    try {
      const { request,response } = requestObj;
     
      const logoutUser = await this.authRepository.logOut(
        request,
        response
      );
      if (AppResult.isInvalid(logoutUser)) {
        return logoutUser;
      }
      return AppResult.ok<ApiResponse<Response<any, Record<string, any>>, unknown>>({ data: logoutUser.getValue() });
    } catch (e) {
      console.log(e);
      return AppResult.fail({code: 'USER_UNEXPECTED_ERROR'})
    }
  }
}
