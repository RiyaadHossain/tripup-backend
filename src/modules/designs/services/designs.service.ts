import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateDesignDto } from '../dto/create-design.dto';
import { UpdateDesignDto } from '../dto/update-design.dto';
import { Prisma } from 'generated/src/prisma/client';

export interface FormattedImage {
  url: string;
  alt?: string;
}

export interface FormattedDesign {
  id: string;
  title: string;
  slug: string;
  images: FormattedImage[];
  clientName: string | null;
  deliveryDate: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DesignsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transforms a database Design record to the exact response shape required by the frontend.
   */
  formatDesign(design: {
    id: string;
    title: string;
    slug: string;
    images: any;
    clientName: string | null;
    deliveryDate: Date | string | null;
    isPublished: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): FormattedDesign {
    const rawImages = Array.isArray(design.images)
      ? design.images
      : typeof design.images === 'string'
        ? JSON.parse(design.images)
        : [];

    const images: FormattedImage[] = rawImages.map((img: any) => {
      const item: FormattedImage = { url: img.url };
      if (img.alt !== undefined && img.alt !== null && img.alt !== '') {
        item.alt = img.alt;
      }
      return item;
    });

    let formattedDeliveryDate: string | null = null;
    if (design.deliveryDate) {
      if (design.deliveryDate instanceof Date) {
        formattedDeliveryDate = design.deliveryDate.toISOString().slice(0, 10);
      } else if (typeof design.deliveryDate === 'string') {
        formattedDeliveryDate = design.deliveryDate.slice(0, 10);
      }
    }

    return {
      id: design.id,
      title: design.title,
      slug: design.slug,
      images,
      clientName: design.clientName ?? null,
      deliveryDate: formattedDeliveryDate,
      isPublished: design.isPublished,
      createdAt:
        design.createdAt instanceof Date
          ? design.createdAt.toISOString()
          : new Date(design.createdAt).toISOString(),
      updatedAt:
        design.updatedAt instanceof Date
          ? design.updatedAt.toISOString()
          : new Date(design.updatedAt).toISOString(),
    };
  }

  /**
   * Converts a title into a URL-friendly slug.
   */
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
      .slice(0, 160)
      .replace(/-+$/, '');
  }

  /**
   * Generates a unique slug from title, appending -1, -2, etc. if collisions exist.
   */
  async generateUniqueSlug(title: string): Promise<string> {
    const base = this.slugify(title) || 'design';
    let candidate = base.slice(0, 160).replace(/-+$/, '');

    const existing = await this.prisma.design.findFirst({
      where: { slug: { equals: candidate, mode: 'insensitive' } },
    });

    if (!existing) {
      return candidate;
    }

    let counter = 1;
    while (true) {
      const suffix = `-${counter}`;
      const maxBaseLen = 160 - suffix.length;
      const truncatedBase = base.slice(0, maxBaseLen).replace(/-+$/, '');
      candidate = `${truncatedBase}${suffix}`;

      const found = await this.prisma.design.findFirst({
        where: { slug: { equals: candidate, mode: 'insensitive' } },
      });

      if (!found) {
        return candidate;
      }
      counter++;
    }
  }

  /**
   * Public: List all published designs, newest first.
   */
  async findAllPublic(): Promise<FormattedDesign[]> {
    const designs = await this.prisma.design.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    return designs.map((d) => this.formatDesign(d));
  }

  /**
   * Public: Find one design by slug (case-insensitive). Unpublished designs return 404.
   */
  async findBySlugPublic(slug: string): Promise<FormattedDesign> {
    const design = await this.prisma.design.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        isPublished: true,
      },
    });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    return this.formatDesign(design);
  }

  /**
   * Admin: List ALL designs (published and unpublished), newest first.
   */
  async findAllAdmin(): Promise<FormattedDesign[]> {
    const designs = await this.prisma.design.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return designs.map((d) => this.formatDesign(d));
  }

  /**
   * Admin: Create design.
   */
  async create(
    dto: CreateDesignDto,
    rawBody?: Record<string, any>,
  ): Promise<FormattedDesign> {
    const trimmedTitle = dto.title.trim();

    let finalSlug: string;
    if (dto.slug && dto.slug.trim().length > 0) {
      const normalizedSlug = dto.slug.trim().toLowerCase();
      const existing = await this.prisma.design.findFirst({
        where: { slug: { equals: normalizedSlug, mode: 'insensitive' } },
      });

      if (existing) {
        throw new ConflictException('A design with this slug already exists');
      }
      finalSlug = normalizedSlug;
    } else {
      finalSlug = await this.generateUniqueSlug(trimmedTitle);
    }

    const imagesData = dto.images.map((img) => {
      const item: FormattedImage = { url: img.url.trim() };
      if (img.alt !== undefined && img.alt !== null && img.alt.trim() !== '') {
        item.alt = img.alt.trim();
      }
      return item;
    });

    const isPublished =
      dto.isPublished !== undefined ? Boolean(dto.isPublished) : true;

    let deliveryDate: Date | null = null;
    if (dto.deliveryDate) {
      deliveryDate = new Date(`${dto.deliveryDate}T00:00:00.000Z`);
    }

    const clientName =
      dto.clientName !== undefined && dto.clientName !== null
        ? dto.clientName.trim()
        : null;

    const design = await this.prisma.design.create({
      data: {
        title: trimmedTitle,
        slug: finalSlug,
        images: imagesData as unknown as Prisma.InputJsonValue,
        clientName,
        deliveryDate,
        isPublished,
      },
    });

    return this.formatDesign(design);
  }

  /**
   * Admin: Partial update.
   */
  async update(
    id: string,
    dto: UpdateDesignDto,
    rawBody?: Record<string, any>,
  ): Promise<FormattedDesign> {
    const existing = await this.prisma.design.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Design not found');
    }

    const dataToUpdate: Prisma.DesignUpdateInput = {};

    if (dto.title !== undefined) {
      dataToUpdate.title = dto.title.trim();
    }

    if (dto.slug !== undefined && dto.slug.trim().length > 0) {
      const normalizedSlug = dto.slug.trim().toLowerCase();
      const collision = await this.prisma.design.findFirst({
        where: {
          slug: { equals: normalizedSlug, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (collision) {
        throw new ConflictException('A design with this slug already exists');
      }

      dataToUpdate.slug = normalizedSlug;
    }

    if (dto.images !== undefined) {
      dataToUpdate.images = dto.images.map((img) => {
        const item: FormattedImage = { url: img.url.trim() };
        if (img.alt !== undefined && img.alt !== null && img.alt.trim() !== '') {
          item.alt = img.alt.trim();
        }
        return item;
      }) as unknown as Prisma.InputJsonValue;
    }

    if (dto.isPublished !== undefined) {
      dataToUpdate.isPublished = Boolean(dto.isPublished);
    }

    const bodyKeys = rawBody || dto;
    if ('clientName' in bodyKeys) {
      dataToUpdate.clientName =
        dto.clientName !== null && dto.clientName !== undefined
          ? dto.clientName.trim()
          : null;
    }

    if ('deliveryDate' in bodyKeys) {
      dataToUpdate.deliveryDate =
        dto.deliveryDate !== null && dto.deliveryDate !== undefined
          ? new Date(`${dto.deliveryDate}T00:00:00.000Z`)
          : null;
    }

    const updated = await this.prisma.design.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.formatDesign(updated);
  }

  /**
   * Admin: Hard delete.
   */
  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.design.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Design not found');
    }

    await this.prisma.design.delete({
      where: { id },
    });

    return { id };
  }
}
