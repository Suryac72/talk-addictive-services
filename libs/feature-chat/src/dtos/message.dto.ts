export class FetchMessageDTO {
    messageId: string;
    sender : {
        userId: string;
        email: string;
        name?: string;
        pic?:string;
    };
    content: string;
    chat: string | null;
}
