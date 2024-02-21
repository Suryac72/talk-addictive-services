export const USER_ACCESS_ERRORS = {
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SESSION_EXPIRED:'SESSION_EXPIRED'
};

export const USER_BAD_REQUEST_ERRORS = {
  INVALID_USER_BODY: 'INVALID_USER_BODY',
  USERNAME_NOT_FOUND: 'USERNAME_NOT_FOUND',
  INVALID_USERNAME: 'INVALID_USERNAME',
  PASSWORD_NOT_FOUND: 'PASSWORD_NOT_FOUND',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  EMAIL_NOT_FOUND: 'EMAIL_NOT_FOUND',
  INVALID_EMAIL: 'INVALID_EMAIL',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  INVALID_ROLE: 'INVALID_ROLE',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
};

export enum ROLES {
  ADMIN = 1,
  USER = 2,
}

export enum STATUS {
  ACTIVE = 1,
  INACTIVE,
}