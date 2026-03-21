import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { SwipeType } from '../../generated/prisma/enums';

export class SwipePostDto {
  @ApiProperty({
    description: 'ID of the post to swipe on',
  })
  @IsUUID()
  @IsNotEmpty()
  postId!: string;

  @ApiProperty({
    example: SwipeType.LIKE,
    enum: SwipeType,
    description: 'Type of swipe action LIKE or PASS',
  })
  @IsEnum(SwipeType)
  type!: SwipeType;
}
