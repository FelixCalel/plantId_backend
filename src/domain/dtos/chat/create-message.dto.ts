export class CreateMessageDto {
    conversacionId!: number;
    content!: string;

    role!: 'USUARIO' | 'BOT';
}
