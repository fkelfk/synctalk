import { IsNotEmpty } from 'class-validator';

export class RoomDTO {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}
