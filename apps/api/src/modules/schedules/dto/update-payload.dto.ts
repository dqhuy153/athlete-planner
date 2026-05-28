import { IsNotEmpty } from 'class-validator';

export class UpdatePayloadDto {
  @IsNotEmpty()
  payload: any;
}
