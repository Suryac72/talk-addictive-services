export class User {
  userId?: string;
  name?: string;
  email: string;
}
export class ChatDTO {
  userId?: string;
  isGroupChat: boolean;
  users: User[];
  _id?: string;
  chatName: string;
  groupAdmin?: User;
}

export class FindOneChatDTO extends ChatDTO {
  chatId: string;
}

export class  UserIdDTO {
  userId: string;
} 
export class AddToGroupDTO {
  status: boolean;
  chatId: string;
  userId: UserIdDTO[];
}