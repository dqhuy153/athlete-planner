import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class CloudinarySignService {
  constructor(private readonly config: ConfigService) {}

  getBaseFolder(): string {
    return this.config.get<string>('cloudinary.folder') || this.config.get<string>('CLOUDINARY_FOLDER') || 'app';
  }

  generatePresignedParams(folder: string, publicId: string) {
    const cloudName = this.config.get<string>('cloudinary.cloudName') || this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('cloudinary.apiKey') || this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('cloudinary.apiSecret') || this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha256').update(toSign).digest('hex');

    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  }
}
