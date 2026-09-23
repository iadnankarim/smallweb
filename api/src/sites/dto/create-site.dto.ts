import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/** Same address shape as web/src/lib/address.ts: lowercase letters, digits, hyphens, then .zz */
const ADDRESS_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?\.zz$/;

export class CreateSiteDto {
  @IsString()
  @Matches(ADDRESS_RE, {
    message:
      'address must look like your-address.zz (lowercase letters, digits, hyphens)',
  })
  address!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  html!: string;
}
