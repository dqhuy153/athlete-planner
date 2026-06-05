import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class BulkDeletePrivateExercisesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  ids!: string[];
}
