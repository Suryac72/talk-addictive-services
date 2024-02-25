import { Prisma } from '@prisma/client';

export const queryMaps: Record<
  string,
  (value: any) => Prisma.user_credentialsWhereInput
> = {
  user_email: (value: string) => ({ user_email: { contains: value, mode: 'insensitive'} }),
  user_phone_no: (value: string) => ({ user_phone_no: { contains: value } }),
  user_name: (value: string) => ({ user_name: { contains: value, mode: 'insensitive' } }),
  user_role: (value: string) => ({ user_role: value, mode: 'insensitive' }),
  user_id: (value: string) => ({ user_id: value }),
};
