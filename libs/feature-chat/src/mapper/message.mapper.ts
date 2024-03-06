import { Injectable } from "@nestjs/common";
import { FetchMessageDTO } from "../dtos/message.dto";

@Injectable()
export class MessageMapper {
    toFetchMessageDTO(messages:any) : FetchMessageDTO[] {
        const dto : FetchMessageDTO[] = [];
        messages.map(message => {
            const messageObj : FetchMessageDTO = {
                messageId: message._id,
                sender: {
                    userId: message.sender.userId,
                    email: message.sender.email,
                },
                content: message.content,
                chat: message.chat
            }
            dto.push(messageObj);
        });
        return dto;
    }
}