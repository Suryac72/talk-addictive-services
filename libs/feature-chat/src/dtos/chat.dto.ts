export class User {
    name: string;
    email: string;
}
export class ChatDTO {
    isGroupChat: boolean;
    users: User[];
    _id: string;
    chatName: string;
    groupAdmin?: User;
}