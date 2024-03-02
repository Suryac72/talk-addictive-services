import { isBoolean, isEmail, isString, isUUID } from "class-validator";

export const USER_DOMAIN = {
    userId: {
        validate: isUUID,
        optional: true,
    },
    name: {
        validate: isString,
        optional: false,
    },
    email: {
        validate: isEmail,
        optional: false,
    }
}
export const SAVE_CHAT_DOMAIN = {
    isGroupChat: {
        validate: isBoolean,
        optional: false,
    },
    userId: {
        validate: isString,
        optional: false
    },
    users: {
        validate:[USER_DOMAIN],
        optional: false,
        subDomain: true,
    },
    chatName: {
        validate: isString, 
        optional: false,
    },
    groupAdmin : {
        validate: USER_DOMAIN,
        subDomain: true,
        optional: true
    }
}

export const FIND_ONE_CHAT = {
    userId: {
        validate: isString,
        optional: false
    }
}