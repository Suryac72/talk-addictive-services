import { Injectable } from '@nestjs/common';
import { USER_BAD_REQUEST_ERRORS } from '../../const/auth.constants';
import { AuthRepository } from '@app/feature-auth/repo/auth.repository';
import { UserSignUpDTO } from '@app/feature-auth/dtos/user.dto';
import { FIND_ALL_USERS_DOMAIN, SIGN_UP_DOMAIN } from '@app/feature-auth/domains/auth.domain';
import { ApiResponse, AppError, AppResult, DomainService, UseCase } from '@suryac72/api-core-services';
import { FindAllUserQuery } from './find-all-users.dto';


type FindAllUserRequest = {
  query: FindAllUserQuery;
};

type Response =
  | AppResult<AppError>
  | AppResult<ApiResponse<UserSignUpDTO[], unknown>>;

@Injectable()
export class FindAllUsersUseCase implements UseCase<FindAllUserRequest, Response> {
  constructor(
    private authRepository: AuthRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(request: FindAllUserRequest): Promise<Response> {
    try {
      const { query } = request;
      if (Object.values(query).length <= 0) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.INVALID_QUERY,
        });
      }

      const userDomain = this.domainService.validateAndCreateDomain(
        FIND_ALL_USERS_DOMAIN,
        query,
      );
      if (AppResult.isInvalid(userDomain)) {
        return userDomain;
      }
      const findUser = await this.authRepository.findAllUsers(
        userDomain.getValue(),
      );
      if (AppResult.isInvalid(findUser)) {
        return findUser;
      }
      return AppResult.ok({ data: findUser.getValue() });
    } catch (e) {
      console.log(e);
      return AppResult.fail({code: 'USER_UNEXPECTED_ERROR'})
    }
  }
}
