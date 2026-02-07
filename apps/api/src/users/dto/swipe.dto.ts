import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { SwipeType } from '../../generated/prisma/enums';

export class SwipeDto {
  @ApiProperty({
    description: 'ID of the user to swipe on',
  })
  @IsUUID()
  @IsNotEmpty()
  toUserId!: string;

  @ApiProperty({
    example: SwipeType.PASS,
    enum: SwipeType,
    description: 'Type of swipe action LIKE or PASS',
  })
  @IsEnum(SwipeType)
  type!: SwipeType;
}
