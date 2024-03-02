import { User } from "@app/feature-chat/dtos/chat.dto";

export class ChatRequestDTO {
    isGroupChat: boolean;
    users: User[];
    userId: string;
    chatName: string;
    groupAdmin?: User;
}