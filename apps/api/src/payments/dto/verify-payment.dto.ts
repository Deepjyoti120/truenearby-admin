import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_XXXXXXXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_XXXXXXXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @ApiProperty({
    description: 'HMAC signature returned by Razorpay checkout on success.',
  })
  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}
