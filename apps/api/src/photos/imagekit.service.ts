import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit, { toFile } from '@imagekit/nodejs';

@Injectable()
export class ImageKitService {
  private readonly imagekit: ImageKit;

  constructor(private readonly config: ConfigService) {
    const publicKey = this.config.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.config.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.config.get<string>('IMAGEKIT_URL_ENDPOINT');

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit environment variables are missing');
    }

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    } as unknown as ConstructorParameters<typeof ImageKit>[0]);
  }

  getUploadAuth() {
    return this.imagekit.helper.getAuthenticationParameters();
  }

  async uploadFile(file: Express.Multer.File): Promise<ImageKitUploadResult> {
    const ikFile = await toFile(file.buffer, file.originalname);
    const res = await this.imagekit.files.upload({
      file: ikFile,
      fileName: file.originalname,
      folder: '/dating-app/photos',
    });
    if (!res?.url || !res?.fileId) {
      throw new Error('Invalid ImageKit response');
    }
    return {
      url: res.url,
      fileId: res.fileId,
    };
  }
  async delete(file: Express.Multer.File) {
    const ikFile = await toFile(file.buffer, file.originalname);
    const res = await this.imagekit.files.upload({
      file: ikFile,
      fileName: file.originalname,
      folder: '/dating-app/photos',
    });
    return res;
  }
}

type ImageKitUploadResult = {
  url: string;
  fileId: string;
};
