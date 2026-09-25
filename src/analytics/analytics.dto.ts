import { IsEnum, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export enum PostAnalyticsEvent {
  VIEW = 'VIEW',
  SHARE = 'SHARE',
  CLICK = 'CLICK',
}

export class RecordPostAnalyticsDto {
  @IsEnum(PostAnalyticsEvent)
  event!: PostAnalyticsEvent;
}

export class RecordPageVisitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  route!: string;

  @IsUrl()
  @MaxLength(2000)
  pageUrl!: string;
}
