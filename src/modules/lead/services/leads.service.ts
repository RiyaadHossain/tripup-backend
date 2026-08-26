import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { QueryLeadsDto } from '../dto/query-leads.dto';
import { UploadLeadsDto } from '../dto/upload-leads.dto';
import { Prisma } from 'generated/src/prisma/client';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly repository: LeadsRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateLeadDto, userId: string) {
    const lead = await this.repository.create({
      ...dto,
      addedBy: userId ? { connect: { id: userId } } : undefined,
    });

    this.activityService.log('CREATE', 'leads', userId, {
      id: lead.id,
      name: lead.businessName,
    });

    return lead;
  }

  async findAll(query: QueryLeadsDto) {
    const { page, limit, search, status, isPotential, priority, source } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (source) {
      where.source = source;
    }

    if (isPotential !== undefined) {
      where.isPotential = isPotential;
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.repository.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.repository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const lead = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'leads', userId, {
      id: lead.id,
      name: lead.businessName,
    });

    return lead;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    this.activityService.log('DELETE', 'leads', userId, {
      id: existing.id,
      name: existing.businessName,
    });

    return this.repository.delete(id);
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'leads', userId, null);
    return this.repository.deleteMany(ids);
  }

  async uploadCSV(file: Express.Multer.File, commonFields: UploadLeadsDto, userId: string) {
    if (!file || !file.buffer) {
      throw new Error('CSV file is empty or missing');
    }

    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      throw new Error('CSV file has no content');
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(val => val.replace(/^"|"$/g, '').trim());
    };

    const headers = parseCSVLine(lines[0]);
    
    const headerMap: Record<string, string> = {
      'agency name': 'businessName',
      'business name': 'businessName',
      'name': 'businessName',
      'agencyname': 'businessName',
      'type': 'niche',
      'source': 'source',
      'lead source': 'source',
      'website': 'website',
      'phone': 'phone',
      'facebook': 'facebookLink',
      'instagram': 'instagramLink',
      'linkedin': 'linkedInLink',
      'twitter': 'twitterLink',
      'email': 'email',
      'contact person': 'contactPerson',
      'notes': 'notes',
      'priority': 'priority',
    };

    const formatUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;
      const clean = url.trim();
      if (clean.toLowerCase() === 'not found' || clean === '') return undefined;
      if (/^https?:\/\//i.test(clean)) {
        return clean;
      }
      return `https://${clean}`;
    };

    const formatEmail = (email: string | undefined): string | undefined => {
      if (!email) return undefined;
      const clean = email.trim();
      if (clean.toLowerCase() === 'not found' || clean === '' || !clean.includes('@')) return undefined;
      return clean;
    };

    const leadsToCreate: Prisma.LeadCreateManyInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const record: Record<string, any> = {};

      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        const mappedField = headerMap[cleanHeader];
        if (mappedField && index < values.length) {
          const val = values[index];
          if (val && val.toLowerCase() !== 'not found') {
            record[mappedField] = val;
          }
        }
      });

      if (!record.businessName) {
        continue;
      }

      if (record.website) record.website = formatUrl(record.website);
      if (record.facebookLink) record.facebookLink = formatUrl(record.facebookLink);
      if (record.instagramLink) record.instagramLink = formatUrl(record.instagramLink);
      if (record.linkedInLink) record.linkedInLink = formatUrl(record.linkedInLink);
      if (record.twitterLink) record.twitterLink = formatUrl(record.twitterLink);
      if (record.email) record.email = formatEmail(record.email);

      const mergedLead: any = {
        ...record,
        ...commonFields,
      };

      if (!mergedLead.status) {
        mergedLead.status = 'NEW';
      }

      leadsToCreate.push({
        businessName: mergedLead.businessName,
        email: mergedLead.email || null,
        phone: mergedLead.phone || null,
        location: mergedLead.location || null,
        status: mergedLead.status,
        priority: mergedLead.priority || 'MEDIUM',
        source: mergedLead.source || null,
        niche: mergedLead.niche || null,
        facebookLink: mergedLead.facebookLink || null,
        linkedInLink: mergedLead.linkedInLink || null,
        instagramLink: mergedLead.instagramLink || null,
        twitterLink: mergedLead.twitterLink || null,
        website: mergedLead.website || null,
        contactPerson: mergedLead.contactPerson || null,
        notes: mergedLead.notes || null,
        isPotential: mergedLead.isPotential ?? false,
        addedById: userId || null,
      });
    }

    if (leadsToCreate.length === 0) {
      return { count: 0, message: 'No valid leads found in CSV' };
    }

    const result = await this.repository.createMany(leadsToCreate);

    this.activityService.log('CREATE', 'leads', userId, {
      id: 'bulk',
      name: `CSV import — ${result.count} lead(s)`,
    });

    return {
      count: result.count,
      message: `${result.count} leads successfully created`,
    };
  }
}
