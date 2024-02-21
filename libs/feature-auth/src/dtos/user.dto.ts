/* eslint-disable prettier/prettier */
export class UserLoginDTO {
    userName : string;
    password : string;
}

export class UserSignUpDTO {
    userName : string;
    email : string;
    phoneNo: string;
    role ?: number;
    status?: string;
}

export class LoginResponse {
    token: string;
}