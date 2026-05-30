import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PrismaService } from '@athlete-planner/database';
import { UserRole } from '@athlete-planner/contracts';
import { S3Service } from '../shared/s3.service';
import { CloudinarySignService } from '../shared/cloudinary-sign.service';
import { AIService } from '../shared/ai.service';
import { AdminGuard } from './admin.guard';
import { ConfigService } from '@nestjs/config';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import crypto from 'crypto';
import { SeedGymExercisesCommand } from './commands/seed-gym-exercises.command';
import { SeedRunningExercisesCommand } from './commands/seed-running-exercises.command';
import { SeedFreeExerciseDbCommand } from './commands/seed-free-exercise-db.command';
import { AIGenerateGymExercisesCommand } from './commands/ai-generate-gym-exercises.command';
import { AIGenerateRunningExercisesCommand } from './commands/ai-generate-running-exercises.command';

export class GenerateExerciseContentDto {
  @IsString()
  name!: string;

  @IsEnum(['GYM', 'RUNNING'])
  sportType!: 'GYM' | 'RUNNING';

  @IsString()
  @IsOptional()
  muscleGroup?: string;

  @IsString()
  @IsOptional()
  runningType?: string;
}

export class AIGenerateExercisesDto {
  @IsString()
  prompt!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  count: number = 5;

  @IsString()
  @IsOptional()
  muscleGroup?: string;

  @IsString()
  @IsOptional()
  runningType?: string;
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly cloudinarySign: CloudinarySignService,
    private readonly config: ConfigService,
    private readonly aiService: AIService,
    private readonly commandBus: CommandBus,
  ) {}

  // ── User Management ─────────────────────────────────────────────────────────

  // ── Exercise Content Generation ─────────────────────────────────────────────

  @Post('exercises/generate-content')
  async generateExerciseContent(@Body() body: GenerateExerciseContentDto) {
    const contextDetails = body.sportType === 'GYM'
      ? `Target muscle group: ${body.muscleGroup || 'not specified'}`
      : `Running type: ${body.runningType || 'not specified'}`;

    const isGym = body.sportType === 'GYM';

    const prompt = isGym
      ? `Generate content for this gym exercise.
Exercise name: ${body.name}
${contextDetails}

Respond with JSON only (no markdown):
{
  "vietnameseName": "Vietnamese translation or transliteration of the exercise name",
  "beginner": {
    "steps_en": ["Step 1 in English", "Step 2 in English"],
    "steps_vi": ["Bước 1 tiếng Việt", "Bước 2 tiếng Việt"],
    "form_cues_en": ["Form cue 1", "Form cue 2"],
    "form_cues_vi": ["Gợi ý kỹ thuật 1", "Gợi ý kỹ thuật 2"]
  },
  "advanced": {
    "steps_en": ["Advanced step 1", "Advanced step 2"],
    "steps_vi": ["Bước nâng cao 1", "Bước nâng cao 2"],
    "form_cues_en": ["Advanced cue 1"],
    "form_cues_vi": ["Gợi ý nâng cao 1"]
  }
}`
      : `Generate content for this running workout.
Workout name: ${body.name}
${contextDetails}

Respond with JSON only (no markdown):
{
  "vietnameseName": "Vietnamese translation or transliteration",
  "instructions_en": ["Instruction step 1 in English", "Instruction step 2"],
  "instructions_vi": ["Hướng dẫn bước 1 tiếng Việt", "Hướng dẫn bước 2"]
}`;

    const result = await this.aiService.generateText({ prompt });

    let content: Record<string, any> = {};
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) content = JSON.parse(jsonMatch[0]);
    } catch {
      content = { raw: result.text };
    }

    return { content };
  }

  // ── Exercise Seed ────────────────────────────────────────────────────────────

  @Post('exercises/seed/gym')
  async seedGymExercises() {
    return this.commandBus.execute(new SeedGymExercisesCommand());
  }

  @Post('exercises/seed/running')
  async seedRunningExercises() {
    return this.commandBus.execute(new SeedRunningExercisesCommand());
  }

  @Post('exercises/seed/free-exercise-db')
  async seedFreeExerciseDb() {
    return this.commandBus.execute(new SeedFreeExerciseDbCommand());
  }

  // ── AI Bulk Generate ─────────────────────────────────────────────────────────

  @Post('exercises/ai-generate/gym')
  async aiGenerateGymExercises(@Body() body: AIGenerateExercisesDto) {
    const exercises = await this.commandBus.execute(
      new AIGenerateGymExercisesCommand(body.prompt, body.count ?? 5, body.muscleGroup),
    );
    return { exercises };
  }

  @Post('exercises/ai-generate/running')
  async aiGenerateRunningExercises(@Body() body: AIGenerateExercisesDto) {
    const exercises = await this.commandBus.execute(
      new AIGenerateRunningExercisesCommand(body.prompt, body.count ?? 5, body.runningType),
    );
    return { exercises };
  }
  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = Math.min(parseInt(limit || '50', 10), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: any = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: { id: true, email: true, name: true, role: true, tier: true, createdAt: true, avatarUrl: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page: pageNum, limit: limitNum };
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    const validRoles = [UserRole.USER, UserRole.ADMIN];
    if (!validRoles.includes(body.role as UserRole)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ROOT) throw new BadRequestException('Cannot change ROOT user role');

    return this.prisma.user.update({
      where: { id },
      data: { role: body.role as any },
      select: { id: true, email: true, role: true },
    });
  }

  // ── Asset Upload Management ──────────────────────────────────────────────────

  @Get('assets')
  async getAssets(@Query('provider') provider?: string, @Query('category') category?: string) {
    const where: any = {};
    if (provider) where.storageProvider = provider;
    if (category) where.category = category;
    return this.prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Get('assets/presign-upload')
  async presignAssetUpload(
    @Query('contentType') contentType: string,
    @Query('ext') ext: string,
    @Query('category') category?: string,
  ) {
    const key = `assets/${category || 'general'}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const uploadUrl = await this.s3Service.getSignedPutUrl(key, contentType);
    return { uploadUrl, key };
  }

  @Post('assets/confirm-upload')
  async confirmAssetUpload(
    @Body() body: { key: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
  ) {
    const url = this.s3Service.getPublicUrl(body.key);
    return this.prisma.asset.create({
      data: {
        fileName: body.fileName,
        url,
        key: body.key,
        storageProvider: 'r2',
        mimeType: body.mimeType,
        size: body.size,
        category: body.category || 'general',
        uploadedBy: body.userId,
      },
    });
  }

  @Get('assets/cloudinary-presign')
  async cloudinaryAssetPresign(@Query('contentType') contentType: string, @Query('category') category?: string) {
    const baseFolder = this.cloudinarySign.getBaseFolder();
    const folder = `${baseFolder}/${category || 'assets'}`;
    const publicId = `${category || 'asset'}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return this.cloudinarySign.generatePresignedParams(folder, publicId);
  }

  @Post('assets/confirm-cloudinary')
  async confirmCloudinaryAsset(
    @Body() body: { secureUrl: string; publicId?: string; fileName: string; mimeType?: string; size?: number; category?: string; userId?: string },
  ) {
    return this.prisma.asset.create({
      data: {
        fileName: body.fileName,
        url: body.secureUrl,
        key: body.publicId,
        storageProvider: 'cloudinary',
        mimeType: body.mimeType,
        size: body.size,
        category: body.category || 'general',
        uploadedBy: body.userId,
      },
    });
  }

  @Delete('assets/:id')
  async deleteAsset(@Param('id') id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    if (asset.key) {
      if (asset.storageProvider === 'r2') {
        await this.s3Service.delete(asset.key);
      } else if (asset.storageProvider === 'cloudinary') {
        await this.deleteFromCloudinary(asset.key);
      }
    }

    await this.prisma.asset.delete({ where: { id } });
    return { deleted: true };
  }

  private async deleteFromCloudinary(publicId: string): Promise<void> {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary is not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha256')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  }
}
