import { Injectable } from '@nestjs/common';
import { user_credentials } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, STATUS } from '../const/auth.constants';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserSignUpDTO } from '../dtos/user.dto';

@Injectable()
export class AuthMapper {
  constructor(private readonly configService: ConfigService) {}
  async toDomainFromPersistance(userDetails: any): Promise<user_credentials> {
    const persistence: user_credentials = {} as user_credentials;
    persistence.user_email = userDetails.email?.value;
    persistence.user_name = userDetails.userName?.value;
    persistence.user_password = await this.hashPassword(
      userDetails.password?.value,
    );
    persistence.created_at = new Date().toISOString();
    persistence.user_phone_no = userDetails.phoneNo?.value;
    persistence.user_role = userDetails.role
      ? String(userDetails.role?.value)
      : String(ROLES.USER);
    persistence.user_status = userDetails.status
      ? String(userDetails.status?.value)
      : String(STATUS.INACTIVE);
    persistence.user_id = uuidv4();
    if (userDetails.pic?.value) {
      persistence.user_pic = userDetails.pic?.value;
    }
    return persistence;
  }

  toDto(userDetails: user_credentials): UserSignUpDTO {
    const dto: UserSignUpDTO = {} as UserSignUpDTO;
    (dto.id = userDetails.user_id), (dto.email = userDetails.user_email);
    dto.phoneNo = userDetails.user_phone_no;
    dto.userName = userDetails.user_name;
    dto.role = Number(userDetails.user_role);
    dto.status = String(userDetails.user_status);
    if (userDetails.user_pic) {
      dto.pic = userDetails.user_pic;
    }
    return dto;
  }

  async hashPassword(password: string) {
    const saltOrRounds = this.configService.get('SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(password, Number(saltOrRounds));
    return hashedPassword;
  }

  toFindAllPersistence(userDetails: any): Partial<user_credentials> {
    const persistence: Partial<user_credentials> =
      {} as Partial<user_credentials>;
    if (userDetails.email.value) {
      persistence.user_email = userDetails.email?.value;
    }
    if (userDetails.phoneNo.value) {
      persistence.user_phone_no = userDetails.phoneNo?.value;
    }
    if (userDetails.userName.value) {
      persistence.user_name = userDetails.userName?.value;
    }

    if (userDetails.role.value) {
      persistence.user_role = userDetails.role.value;
    }

    if (userDetails.status.value) {
      persistence.user_status = userDetails.status;
    }

    if (userDetails.userId.value) {
      persistence.user_id = userDetails.userId.value;
    }
    return persistence;
  }
}
