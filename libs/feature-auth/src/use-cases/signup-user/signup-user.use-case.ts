import { Injectable, Logger } from '@nestjs/common';
import { SignupDTO } from './signup-user.dto';
import { USER_BAD_REQUEST_ERRORS } from '../../const/auth.constants';
import { AuthRepository } from '@app/feature-auth/repo/auth.repository';
import { UserSignUpDTO } from '@app/feature-auth/dtos/user.dto';
import { SIGN_UP_DOMAIN } from '@app/feature-auth/domains/auth.domain';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';

type UserSignupRequest = {
  body: SignupDTO;
};

type Response =
  | AppResult<AppError>
  | AppResult<ApiResponse<UserSignUpDTO, unknown>>;

@Injectable()
export class UserSignupUseCase implements UseCase<UserSignupRequest, Response> {
  constructor(
    private authRepository: AuthRepository,
    private readonly domainService: DomainService,
    private readonly logger: Logger,
  ) {}

  async execute(request: UserSignupRequest): Promise<any> {
    try {
      this.logger.log('Executing UserSignupUseCase..........');
      const { body } = request;
      if (Object.values(body).length <= 0) {
        return AppResult.fail({
          code: USER_BAD_REQUEST_ERRORS.INVALID_USER_BODY,
        });
      }

      const userDomain = this.domainService.validateAndCreateDomain(
        SIGN_UP_DOMAIN,
        body,
      );
      if (AppResult.isInvalid(userDomain)) {
        return userDomain;
      }
      const registerUser = await this.authRepository.signup(
        userDomain.getValue(),
      );
      if (AppResult.isInvalid(registerUser)) {
        return registerUser;
      }
      return AppResult.ok({ data: registerUser.getValue() });
    } catch (e) {
      this.logger.error('Error from catch: UserSignupUseCase', e);
      return AppResult.fail({ code: 'USER_UNEXPECTED_ERROR' });
    }
  }
}
