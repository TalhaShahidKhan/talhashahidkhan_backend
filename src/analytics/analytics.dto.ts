import { IsEnum, IsString, IsUrl, MinLength } from 'class-validator';

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
  route!: string;

  @IsUrl()
  pageUrl!: string;
}
