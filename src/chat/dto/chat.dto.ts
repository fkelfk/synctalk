import { Length, IsInt, IsString, Min, Max } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 200)
  description: string;


  @IsString()
  @Length(1, 100)
  topic: string;
}

export class JoinChatDto {
  @IsString()
  @Length(6, 6)
  roomID: string;

  @IsString()
  @Length(1, 25)
  name: string;
}

export class NominationDto {
  @IsString()
  @Length(1, 100)
  text: string;
}