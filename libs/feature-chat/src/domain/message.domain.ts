import { isString } from "class-validator";

export const SEND_MESSAGE = {
    chatId: {
        validate:isString,
        optional:false,
    },
    messageBody: {
        validate: isString,
        optional:false,
    },
    userId: {
        validate: isString,
        optional: false,
    }
}

export const FIND_ALL_MESSAGE = {
    chatId: {
        validate: isString,
        optional:false,
    }
}