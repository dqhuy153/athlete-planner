import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3: S3Client | null = null;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accessKeyId = config.get<string>('r2.accessKeyId') || config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('r2.secretAccessKey') || config.get<string>('R2_SECRET_ACCESS_KEY');
    const accountId = config.get<string>('r2.accountId') || config.get<string>('R2_ACCOUNT_ID');
    const endpoint = config.get<string>('r2.endpoint') || config.get<string>('R2_ENDPOINT');

    this.bucketName = config.get<string>('r2.bucketName') || config.get<string>('R2_BUCKET_NAME') || 'app-assets';
    this.publicUrl = config.get<string>('r2.publicUrl') || config.get<string>('R2_PUBLIC_URL') || '';

    if (accessKeyId && secretAccessKey) {
      const s3Endpoint = endpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: s3Endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.logger.warn('S3/R2 credentials not configured — storage operations will fail');
    }
  }

  async getSignedPutUrl(key: string, contentType: string, expiresIn = 300): Promise<string | null> {
    if (!this.s3) return null;
    try {
      const command = new PutObjectCommand({ Bucket: this.bucketName, Key: key, ContentType: contentType });
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (err: any) {
      this.logger.error(`Failed to get signed PUT URL: ${err.message}`);
      return null;
    }
  }

  async getSignedGetUrl(key: string, expiresIn = 3600): Promise<string | null> {
    if (!this.s3) return null;
    try {
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (err: any) {
      this.logger.error(`Failed to get signed GET URL: ${err.message}`);
      return null;
    }
  }

  getPublicUrl(key: string): string {
    if (this.publicUrl) return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    return key;
  }

  async delete(key: string): Promise<void> {
    if (!this.s3) return;
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
    } catch (err: any) {
      this.logger.error(`Failed to delete from S3: ${err.message}`);
    }
  }
}
