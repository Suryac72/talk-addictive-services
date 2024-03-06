import { User } from "@app/feature-chat/dtos/chat.dto";

export class GroupChatRequestBody {
    chatName: string;
    groupAdmin:string;
    isGroupChat:boolean;
    users: User[];
}