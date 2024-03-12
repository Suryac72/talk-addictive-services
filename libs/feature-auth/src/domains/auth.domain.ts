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
    pic: {
        validate: isString,
        optional:true
    }
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

export const FIND_ALL_USERS_DOMAIN = {
    userId: {
        validate: isString,
        optional: true,
    },
    userName: {
        validate: isString,
        optional: true,
    },
    email: {
        validate: isString && isEmail, 
        optional: true,
    },
    password: {
        validate: isString,
        optional: true,
    },
    phoneNo: {
        validate: isString,
        optional: true,
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