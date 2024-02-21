export class SignupDTO {
    userName: string;
    email : string;
    password: string;
    confirmPassword: string;
    phoneNo: string;
    role?:number;
    status?:boolean;
}