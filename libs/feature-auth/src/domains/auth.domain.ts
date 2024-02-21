import { isBoolean, isEmail, isNumber, isString } from 'class-validator';

export const SIGN_UP_DOMAIN = {
    userName: {
        validate: isString,
        optional: false,
    },
    email: {
        validate: isString && isEmail, 
        optional: false,
    },
    password: {
        validate: isString,
        optional: false,
    },
    phoneNo: {
        validate: isString,
        optional: false,
    },
    role: {
        validate: isNumber,
        optional: true,
    },
    status: {
        validate: isBoolean,
        optional: true,
    },
};


export const LOGIN_DOMAIN = {
    email: {
        validate: isString && isEmail, 
        optional: false,
    },
    password: {
        validate: isString,
        optional: false,
    },
};
