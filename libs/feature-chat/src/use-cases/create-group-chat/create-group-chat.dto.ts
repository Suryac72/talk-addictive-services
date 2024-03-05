import { User } from "@app/feature-chat/dtos/chat.dto";

export class GroupChatRequestBody {
    name: string;
    users: User[];
}