import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { QueryLeadsDto } from '../dto/query-leads.dto';
import { UploadLeadsDto } from '../dto/upload-leads.dto';
import { CreateLeadActivityDto } from '../dto/create-lead-activity.dto';
import { AssignLeadDto } from '../dto/assign-lead.dto';
import {
  LeadStatus,
  LeadActivityType,
  Prisma,
} from 'generated/src/prisma/client';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';
import {
  ACTION_BASED_STATUSES,
  RESULT_BASED_STATUSES,
  getLeadStatusCategory,
  mapLegacyStatus,
} from '../constants/lead-status.constant';
import { calculateLeadCompleteness } from '../utils/lead-completeness.util';

@Injectable()
export class LeadsService {
  constructor(
    private readonly repository: LeadsRepository,
    private readonly activityService: UserActivityService,
  ) {}

  /**
   * Enriches raw lead with computed metadata:
   * - completeness (percentage & breakdown)
   * - statusCategory ('ACTION' | 'RESULT')
   */
  private enrichLead<T extends { status: LeadStatus }>(lead: T): T & {
    completeness: number;
    completenessDetails: ReturnType<typeof calculateLeadCompleteness>;
    statusCategory: 'ACTION' | 'RESULT';
  } {
    const completeness = calculateLeadCompleteness(lead as any);
    return {
      ...lead,
      completeness: completeness.percentage,
      completenessDetails: completeness,
      statusCategory: getLeadStatusCategory(lead.status),
    };
  }

  // ---------------------------------------------------------------------------
  // Create Lead
  // ---------------------------------------------------------------------------
  async create(dto: CreateLeadDto, userId: string) {
    // 1. Resolve opportunity from recommendedOpportunity or legacy clientGap
    const recommendedOpportunity =
      dto.recommendedOpportunity ?? dto.clientGap ?? null;

    // 2. Validate rating fields bounds
    if (dto.strength !== undefined && (dto.strength < 1 || dto.strength > 5)) {
      throw new BadRequestException('Strength must be an integer between 1 and 5');
    }
    if (
      dto.qualification !== undefined &&
      (dto.qualification < 1 || dto.qualification > 5)
    ) {
      throw new BadRequestException(
        'Qualification must be an integer between 1 and 5',
      );
    }

    // 3. Resolve status (support legacy mappings if any)
    const status: LeadStatus =
      (dto.status ? mapLegacyStatus(dto.status) : undefined) ?? LeadStatus.NEW;

    const now = new Date();
    const convertedAt = status === LeadStatus.CONVERTED ? now : null;

    // 4. Strip any frontend-submitted ownership/creator properties
    const {
      clientGap: _cg,
      assignedToId,
      ...cleanDto
    } = dto as Record<string, any>;
    delete cleanDto.addedBy;
    delete cleanDto.addedById;
    delete cleanDto.createdBy;
    delete cleanDto.createdById;

    const createData: Prisma.LeadCreateInput = {
      ...cleanDto,
      businessName: dto.businessName,
      status,
      recommendedOpportunity,
      convertedAt,
      lastActivityAt: now,
      addedBy: userId ? { connect: { id: userId } } : undefined,
      assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
    };

    const lead = await this.repository.create(createData);

    // 5. Automatically record initial activity history
    await this.repository.createActivity({
      lead: { connect: { id: lead.id } },
      type: LeadActivityType.LEAD_CREATED,
      description: 'Lead sourced and added to CRM',
      user: userId ? { connect: { id: userId } } : undefined,
      metadata: {
        source: lead.source,
        status: lead.status,
        initialOpportunity: lead.recommendedOpportunity,
      },
    });

    if (assignedToId) {
      await this.repository.createActivity({
        lead: { connect: { id: lead.id } },
        type: LeadActivityType.LEAD_ASSIGNED,
        description: `Lead assigned to team member`,
        user: userId ? { connect: { id: userId } } : undefined,
        metadata: { assignedToId },
      });
    }

    // 6. Log system-level user activity
    this.activityService.log('CREATE', 'leads', userId, {
      id: lead.id,
      name: lead.businessName,
    });

    return this.enrichLead(lead);
  }

  // ---------------------------------------------------------------------------
  // Find All Leads with Comprehensive Filtering
  // ---------------------------------------------------------------------------
  async findAll(query: QueryLeadsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      actionStatus,
      resultStatus,
      statusCategory,
      isPotential,
      priority,
      source,
      location,
      niche,
      recommendedOpportunity,
      strength,
      minStrength,
      maxStrength,
      qualification,
      minQualification,
      maxQualification,
      proposedService,
      addedById,
      assignedToId,
      dateAddedFrom,
      dateAddedTo,
      startDate,
      endDate,
      lastActivityFrom,
      lastActivityTo,
      convertedFrom,
      convertedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = {};

    // 1. Keyword search across multiple fields
    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { businessName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { contactPerson: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { niche: { contains: term, mode: 'insensitive' } },
        { notes: { contains: term, mode: 'insensitive' } },
        { recommendedOpportunity: { contains: term, mode: 'insensitive' } },
        { proposedService: { contains: term, mode: 'insensitive' } },
      ];
    }

    // 2. Status filtering supporting single status, actionStatus, resultStatus, category
    if (status) {
      const mapped = mapLegacyStatus(status);
      if (mapped) where.status = mapped;
    } else if (actionStatus) {
      const mapped = mapLegacyStatus(actionStatus);
      if (mapped && ACTION_BASED_STATUSES.includes(mapped)) {
        where.status = mapped;
      }
    } else if (resultStatus) {
      const mapped = mapLegacyStatus(resultStatus);
      if (mapped && RESULT_BASED_STATUSES.includes(mapped)) {
        where.status = mapped;
      }
    } else if (statusCategory) {
      if (statusCategory === 'ACTION') {
        where.status = { in: [...ACTION_BASED_STATUSES] };
      } else if (statusCategory === 'RESULT') {
        where.status = { in: [...RESULT_BASED_STATUSES] };
      }
    }

    // 3. Simple filters
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (isPotential !== undefined) where.isPotential = isPotential;

    if (location && location.trim().length > 0) {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }

    if (niche && niche.trim().length > 0) {
      where.niche = { contains: niche.trim(), mode: 'insensitive' };
    }

    if (recommendedOpportunity && recommendedOpportunity.trim().length > 0) {
      where.recommendedOpportunity = {
        contains: recommendedOpportunity.trim(),
        mode: 'insensitive',
      };
    }

    if (proposedService && proposedService.trim().length > 0) {
      where.proposedService = {
        contains: proposedService.trim(),
        mode: 'insensitive',
      };
    }

    // 4. Rating filters (Strength & Qualification)
    if (strength !== undefined) {
      where.strength = strength;
    } else if (minStrength !== undefined || maxStrength !== undefined) {
      where.strength = {
        ...(minStrength !== undefined ? { gte: minStrength } : {}),
        ...(maxStrength !== undefined ? { lte: maxStrength } : {}),
      };
    }

    if (qualification !== undefined) {
      where.qualification = qualification;
    } else if (minQualification !== undefined || maxQualification !== undefined) {
      where.qualification = {
        ...(minQualification !== undefined ? { gte: minQualification } : {}),
        ...(maxQualification !== undefined ? { lte: maxQualification } : {}),
      };
    }

    // 5. User Ownership & Assignment filters
    if (addedById && addedById.trim().length > 0) {
      where.addedById = addedById.trim();
    }
    if (assignedToId && assignedToId.trim().length > 0) {
      where.assignedToId = assignedToId.trim();
    }

    // 6. Date Added / Sourced range (supports dateAddedFrom/dateAddedTo and startDate/endDate)
    const fromDateAdded = dateAddedFrom ?? startDate;
    const toDateAdded = dateAddedTo ?? endDate;
    if (fromDateAdded || toDateAdded) {
      where.createdAt = {
        ...(fromDateAdded ? { gte: new Date(fromDateAdded) } : {}),
        ...(toDateAdded ? { lte: new Date(toDateAdded) } : {}),
      };
    }

    // 7. Last Activity Date range
    if (lastActivityFrom || lastActivityTo) {
      where.lastActivityAt = {
        ...(lastActivityFrom ? { gte: new Date(lastActivityFrom) } : {}),
        ...(lastActivityTo ? { lte: new Date(lastActivityTo) } : {}),
      };
    }

    // 8. Conversion Date range
    if (convertedFrom || convertedTo) {
      where.convertedAt = {
        ...(convertedFrom ? { gte: new Date(convertedFrom) } : {}),
        ...(convertedTo ? { lte: new Date(convertedTo) } : {}),
      };
    }

    // 9. Dynamic Sorting
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'lastActivityAt',
      'convertedAt',
      'businessName',
      'strength',
      'qualification',
      'priority',
      'status',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy = { [sortField]: sortOrder };

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.repository.count(where),
    ]);

    return {
      data: data.map((lead) => this.enrichLead(lead)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Find One Lead with Details, Activities & Relations
  // ---------------------------------------------------------------------------
  async findOne(id: string) {
    const lead = await this.repository.findById(id, true);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.enrichLead(lead);
  }

  // ---------------------------------------------------------------------------
  // Update Lead
  // ---------------------------------------------------------------------------
  async update(id: string, dto: UpdateLeadDto, userId?: string) {
    const existing = await this.repository.findById(id, false);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    // 1. Rating validation
    if (dto.strength !== undefined && (dto.strength < 1 || dto.strength > 5)) {
      throw new BadRequestException('Strength must be an integer between 1 and 5');
    }
    if (
      dto.qualification !== undefined &&
      (dto.qualification < 1 || dto.qualification > 5)
    ) {
      throw new BadRequestException(
        'Qualification must be an integer between 1 and 5',
      );
    }

    // 2. Opportunity migration handling
    let recommendedOpportunity = dto.recommendedOpportunity;
    if (recommendedOpportunity === undefined && dto.clientGap !== undefined) {
      recommendedOpportunity = dto.clientGap;
    }

    // 3. Status handling & transitions
    let status: LeadStatus | undefined = undefined;
    if (dto.status) {
      status = mapLegacyStatus(dto.status);
    }

    const now = new Date();
    let convertedAt = dto.convertedAt ? new Date(dto.convertedAt) : undefined;

    const isStatusChanged = status && status !== existing.status;
    if (isStatusChanged) {
      if (status === LeadStatus.CONVERTED && !convertedAt) {
        convertedAt = now;
      } else if (status !== LeadStatus.CONVERTED && existing.status === LeadStatus.CONVERTED) {
        convertedAt = null as any;
      }
    }

    // 4. Strip frontend-supplied creator overrides
    const {
      clientGap: _cg,
      assignedToId,
      ...cleanDto
    } = dto as Record<string, any>;
    delete cleanDto.addedBy;
    delete cleanDto.addedById;
    delete cleanDto.createdBy;
    delete cleanDto.createdById;

    const updateData: Prisma.LeadUpdateInput = {
      ...cleanDto,
      lastActivityAt: now,
      ...(recommendedOpportunity !== undefined
        ? { recommendedOpportunity }
        : {}),
      ...(status ? { status } : {}),
      ...(convertedAt !== undefined ? { convertedAt } : {}),
      ...(assignedToId !== undefined
        ? assignedToId
          ? { assignedTo: { connect: { id: assignedToId } } }
          : { assignedTo: { disconnect: true } }
        : {}),
    };

    const updatedLead = await this.repository.update(id, updateData);

    // 5. Activity logging for status change
    if (isStatusChanged) {
      await this.repository.createActivity({
        lead: { connect: { id: id } },
        type: LeadActivityType.STATUS_CHANGED,
        description: `Lead status updated from ${existing.status} to ${status}`,
        user: userId ? { connect: { id: userId } } : undefined,
        metadata: {
          previousStatus: existing.status,
          newStatus: status,
        },
      });

      // Log specific outreach/result action if applicable
      const specificActionType = this.resolveActivityTypeForStatus(status!);
      if (specificActionType) {
        await this.repository.createActivity({
          lead: { connect: { id: id } },
          type: specificActionType,
          description: this.resolveActivityDescriptionForStatus(status!),
          user: userId ? { connect: { id: userId } } : undefined,
          metadata: { status },
        });
      }
    }

    // 6. Activity logging for assignment change
    if (assignedToId !== undefined && assignedToId !== existing.assignedToId) {
      await this.repository.createActivity({
        lead: { connect: { id: id } },
        type: LeadActivityType.LEAD_ASSIGNED,
        description: assignedToId
          ? `Lead assigned to team member`
          : `Lead unassigned`,
        user: userId ? { connect: { id: userId } } : undefined,
        metadata: {
          previousAssignedToId: existing.assignedToId,
          newAssignedToId: assignedToId,
        },
      });
    }

    // 7. Activity logging for general information updates
    if (!isStatusChanged && (assignedToId === undefined || assignedToId === existing.assignedToId)) {
      await this.repository.createActivity({
        lead: { connect: { id: id } },
        type: LeadActivityType.LEAD_UPDATED,
        description: 'Lead information updated',
        user: userId ? { connect: { id: userId } } : undefined,
      });
    }

    this.activityService.log('UPDATE', 'leads', userId, {
      id: updatedLead.id,
      name: updatedLead.businessName,
    });

    return this.enrichLead(updatedLead);
  }

  // ---------------------------------------------------------------------------
  // Assign Lead to User
  // ---------------------------------------------------------------------------
  async assign(id: string, dto: AssignLeadDto, userId?: string) {
    const existing = await this.repository.findById(id, false);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const assignedToId = dto.assignedToId || null;
    const now = new Date();

    const updated = await this.repository.update(id, {
      assignedTo: assignedToId
        ? { connect: { id: assignedToId } }
        : { disconnect: true },
      lastActivityAt: now,
    });

    await this.repository.createActivity({
      lead: { connect: { id } },
      type: LeadActivityType.LEAD_ASSIGNED,
      description: assignedToId
        ? `Lead assigned to team member`
        : `Lead unassigned`,
      notes: dto.notes,
      user: userId ? { connect: { id: userId } } : undefined,
      metadata: {
        previousAssignedToId: existing.assignedToId,
        newAssignedToId: assignedToId,
      },
    });

    this.activityService.log('ASSIGN', 'leads', userId, {
      id: updated.id,
      name: updated.businessName,
    });

    return this.enrichLead(updated);
  }

  // ---------------------------------------------------------------------------
  // Lead Activity Timeline Management
  // ---------------------------------------------------------------------------
  async addActivity(
    leadId: string,
    dto: CreateLeadActivityDto,
    userId?: string,
  ) {
    const lead = await this.repository.findById(leadId, false);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const now = new Date();

    // Create activity record
    const activity = await this.repository.createActivity({
      lead: { connect: { id: leadId } },
      type: dto.type,
      description: dto.description,
      notes: dto.notes,
      metadata: dto.metadata as Prisma.InputJsonValue,
      user: userId ? { connect: { id: userId } } : undefined,
    });

    // Update lead's lastActivityAt
    await this.repository.update(leadId, {
      lastActivityAt: now,
    });

    return activity;
  }

  async getActivities(
    leadId: string,
    query?: { order?: 'asc' | 'desc'; page?: number; limit?: number },
  ) {
    const lead = await this.repository.findById(leadId, false);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const order = query?.order === 'asc' ? 'asc' : 'desc';
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 50;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.repository.findActivities({
        where: { leadId },
        orderBy: { createdAt: order },
        skip,
        take: limit,
      }),
      this.repository.count({ id: leadId }),
    ]);

    return {
      data: activities,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Delete Lead
  // ---------------------------------------------------------------------------
  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id, false);

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

  // ---------------------------------------------------------------------------
  // CSV Import
  // ---------------------------------------------------------------------------
  async uploadCSV(
    file: Express.Multer.File,
    commonFields: UploadLeadsDto,
    userId: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('CSV file is empty or missing');
    }

    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
      throw new BadRequestException('CSV file has no content');
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
      return result.map((val) => val.replace(/^"|"$/g, '').trim());
    };

    const headers = parseCSVLine(lines[0]);

    const headerMap: Record<string, string> = {
      'agency name': 'businessName',
      'business name': 'businessName',
      name: 'businessName',
      agencyname: 'businessName',
      type: 'niche',
      niche: 'niche',
      source: 'source',
      'lead source': 'source',
      website: 'website',
      phone: 'phone',
      facebook: 'facebookLink',
      instagram: 'instagramLink',
      linkedin: 'linkedInLink',
      twitter: 'twitterLink',
      email: 'email',
      'contact person': 'contactPerson',
      notes: 'notes',
      priority: 'priority',
      'recommended opportunity': 'recommendedOpportunity',
      recommendedopportunity: 'recommendedOpportunity',
      'client gap': 'recommendedOpportunity',
      clientgap: 'recommendedOpportunity',
      gap: 'recommendedOpportunity',
      strength: 'strength',
      qualification: 'qualification',
      'proposed service': 'proposedService',
      proposedservice: 'proposedService',
      location: 'location',
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
      if (
        clean.toLowerCase() === 'not found' ||
        clean === '' ||
        !clean.includes('@')
      )
        return undefined;
      return clean;
    };

    const parseRating = (val: any): number | null => {
      if (!val) return null;
      const parsed = parseInt(String(val), 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 5) return null;
      return parsed;
    };

    const leadsToCreate: Prisma.LeadCreateManyInput[] = [];
    const now = new Date();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const record: Record<string, any> = {};

      headers.forEach((header, index) => {
        const cleanHeader = header
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .trim();
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
      if (record.facebookLink)
        record.facebookLink = formatUrl(record.facebookLink);
      if (record.instagramLink)
        record.instagramLink = formatUrl(record.instagramLink);
      if (record.linkedInLink)
        record.linkedInLink = formatUrl(record.linkedInLink);
      if (record.twitterLink)
        record.twitterLink = formatUrl(record.twitterLink);
      if (record.email) record.email = formatEmail(record.email);

      const mergedLead: any = {
        ...record,
        ...commonFields,
      };

      const status: LeadStatus =
        mapLegacyStatus(mergedLead.status) ?? LeadStatus.NEW;

      leadsToCreate.push({
        businessName: mergedLead.businessName,
        email: mergedLead.email || null,
        phone: mergedLead.phone || null,
        location: mergedLead.location || null,
        status,
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
        recommendedOpportunity:
          mergedLead.recommendedOpportunity ||
          mergedLead.clientGap ||
          null,
        strength: parseRating(mergedLead.strength),
        qualification: parseRating(mergedLead.qualification),
        proposedService: mergedLead.proposedService || null,
        convertedAt: status === LeadStatus.CONVERTED ? now : null,
        lastActivityAt: now,
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

  // ---------------------------------------------------------------------------
  // Status Activity Helpers
  // ---------------------------------------------------------------------------
  private resolveActivityTypeForStatus(
    status: LeadStatus,
  ): LeadActivityType | null {
    switch (status) {
      case LeadStatus.EMAIL_SENT:
        return LeadActivityType.EMAIL_SENT;
      case LeadStatus.DM_SENT:
        return LeadActivityType.DM_SENT;
      case LeadStatus.COLD_CALL:
        return LeadActivityType.COLD_CALL;
      case LeadStatus.FOLLOWED_UP:
        return LeadActivityType.FOLLOW_UP;
      case LeadStatus.RESPONDED:
        return LeadActivityType.LEAD_RESPONDED;
      case LeadStatus.IGNORED:
        return LeadActivityType.LEAD_IGNORED;
      case LeadStatus.CONVERTED:
        return LeadActivityType.LEAD_CONVERTED;
      default:
        return null;
    }
  }

  private resolveActivityDescriptionForStatus(status: LeadStatus): string {
    switch (status) {
      case LeadStatus.EMAIL_SENT:
        return 'Outreach email sent to prospect';
      case LeadStatus.DM_SENT:
        return 'Direct message sent to prospect';
      case LeadStatus.COLD_CALL:
        return 'Cold call conducted with prospect';
      case LeadStatus.FOLLOWED_UP:
        return 'Follow-up outreach performed with prospect';
      case LeadStatus.RESPONDED:
        return 'Prospect responded to outreach';
      case LeadStatus.IGNORED:
        return 'Prospect ignored outreach or showed no interest';
      case LeadStatus.CONVERTED:
        return 'Lead successfully converted!';
      default:
        return `Status set to ${status}`;
    }
  }
}
