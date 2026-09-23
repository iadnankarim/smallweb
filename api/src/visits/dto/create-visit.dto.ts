import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @IsIn(['page', 'search'])
  kind!: 'page' | 'search';

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(['typed', 'link', 'back', 'forward', 'history', 'search', 'reload'])
  via!: 'typed' | 'link' | 'back' | 'forward' | 'history' | 'search' | 'reload';

  @IsBoolean()
  found!: boolean;
}
