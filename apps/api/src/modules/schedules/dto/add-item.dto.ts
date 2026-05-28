import { IsString, IsNotEmpty } from 'class-validator';

export class AddItemDto {
  @IsString()
  @IsNotEmpty()
  exerciseType: string;

  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsString()
  @IsNotEmpty()
  sportType: string;
}
