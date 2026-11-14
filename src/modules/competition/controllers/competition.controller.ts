import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CompetitionPermissionGuard } from '../guards/competition-permission.guard';
import { CompetitionService } from '../services/competition.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { PatchTeamDto } from '../dto/patch-team.dto';
import { ScoringRulesDto } from '../dto/scoring-rules.dto';
import { CreateChallengeDto } from '../dto/create-challenge.dto';
import { PatchChallengeDto } from '../dto/patch-challenge.dto';
import { ArchiveChallengeDto } from '../dto/archive-challenge.dto';
import { UpsertPerformanceDto } from '../dto/upsert-performance.dto';
import { CreateBadgeDto } from '../dto/create-badge.dto';
import { PatchBadgeDto } from '../dto/patch-badge.dto';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { PatchMilestoneDto } from '../dto/patch-milestone.dto';
import { FinalizeWinnerDto } from '../dto/finalize-winner.dto';

@UseGuards(JwtAuthGuard, CompetitionPermissionGuard)
@Controller('competition')
export class CompetitionController {
  constructor(private readonly service: CompetitionService) {}

  // ---------------------------------------------------------------------------
  // 1. Bootstrap / Overview
  // ---------------------------------------------------------------------------
  @Get('overview')
  async getOverview(@Query('month') month?: string) {
    const data = await this.service.getOverview(month);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 2. Categories
  // ---------------------------------------------------------------------------
  @Get('categories')
  async getCategories() {
    const data = await this.service.getCategories();
    return { success: true, data };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    const data = await this.service.createCategory(dto);
    return { success: true, data };
  }

  @Delete('categories/:name')
  async deleteCategory(@Param('name') name: string) {
    const data = await this.service.deleteCategory(name);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 3. Teams
  // ---------------------------------------------------------------------------
  @Get('teams')
  async getTeams(
    @Query('active') active?: string,
    @Query('category') category?: string,
  ) {
    const activeBool =
      active === 'true' ? true : active === 'false' ? false : undefined;
    const data = await this.service.getTeams(activeBool, category);
    return { success: true, data };
  }

  @Get('teams/:id')
  async getTeam(@Param('id') id: string) {
    const data = await this.service.getTeam(id);
    return { success: true, data };
  }

  @Post('teams')
  @HttpCode(HttpStatus.CREATED)
  async createTeam(@Body() dto: CreateTeamDto) {
    const data = await this.service.createTeam(dto);
    return { success: true, data };
  }

  @Patch('teams/:id')
  async patchTeam(@Param('id') id: string, @Body() dto: PatchTeamDto) {
    const data = await this.service.patchTeam(id, dto);
    return { success: true, data };
  }

  @Delete('teams/:id')
  async deleteTeam(@Param('id') id: string) {
    const data = await this.service.deleteTeam(id);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 4. Scoring Rules (Global Defaults)
  // ---------------------------------------------------------------------------
  @Get('scoring-rules')
  async getScoringRules() {
    const data = await this.service.getScoringRules();
    return { success: true, data };
  }

  @Put('scoring-rules')
  async putScoringRules(@Body() dto: ScoringRulesDto) {
    const data = await this.service.putScoringRules(dto);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 5. Challenges
  // ---------------------------------------------------------------------------
  @Get('challenges')
  async getChallenges(
    @Query('archived') archived?: string,
    @Query('active') active?: string,
  ) {
    const archivedBool =
      archived === 'true' ? true : archived === 'false' ? false : undefined;
    const activeBool =
      active === 'true' ? true : active === 'false' ? false : undefined;
    const data = await this.service.getChallenges(archivedBool, activeBool);
    return { success: true, data };
  }

  @Get('challenges/:id')
  async getChallenge(@Param('id') id: string) {
    const data = await this.service.getChallenge(id);
    return { success: true, data };
  }

  @Post('challenges')
  @HttpCode(HttpStatus.CREATED)
  async createChallenge(@Body() dto: CreateChallengeDto) {
    const data = await this.service.createChallenge(dto);
    return { success: true, data };
  }

  @Patch('challenges/:id')
  async patchChallenge(
    @Param('id') id: string,
    @Body() dto: PatchChallengeDto,
  ) {
    const data = await this.service.patchChallenge(id, dto);
    return { success: true, data };
  }

  @Patch('challenges/:id/archive')
  async archiveChallenge(
    @Param('id') id: string,
    @Body() dto: ArchiveChallengeDto,
  ) {
    const data = await this.service.archiveChallenge(id, dto);
    return { success: true, data };
  }

  @Delete('challenges/:id')
  async deleteChallenge(@Param('id') id: string) {
    const data = await this.service.deleteChallenge(id);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 6. Performance Records
  // ---------------------------------------------------------------------------
  @Get('performance')
  async getPerformance(
    @Query('month') month?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('employeeId') employeeId?: string,
    @Query('teamId') teamId?: string,
  ) {
    const data = await this.service.getPerformance({
      month,
      from,
      to,
      employeeId,
      teamId,
    });
    return { success: true, data };
  }

  @Put('performance')
  async upsertPerformance(@Body() dto: UpsertPerformanceDto) {
    const data = await this.service.upsertPerformance(dto);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 7. Badges
  // ---------------------------------------------------------------------------
  @Get('badges')
  async getBadges() {
    const data = await this.service.getBadges();
    return { success: true, data };
  }

  @Post('badges')
  @HttpCode(HttpStatus.CREATED)
  async createBadge(@Body() dto: CreateBadgeDto) {
    const data = await this.service.createBadge(dto);
    return { success: true, data };
  }

  @Patch('badges/:id')
  async patchBadge(@Param('id') id: string, @Body() dto: PatchBadgeDto) {
    const data = await this.service.patchBadge(id, dto);
    return { success: true, data };
  }

  @Delete('badges/:id')
  async deleteBadge(@Param('id') id: string) {
    const data = await this.service.deleteBadge(id);
    return { success: true, data };
  }

  @Get('badges/:id/earners')
  async getBadgeEarners(@Param('id') id: string) {
    const data = await this.service.getBadgeEarners(id);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 8. Achievements
  // ---------------------------------------------------------------------------
  @Get('achievements')
  async getAchievements(
    @Query('recipientId') recipientId?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.service.getAchievements(recipientId, month);
    return { success: true, data };
  }

  @Post('achievements')
  @HttpCode(HttpStatus.CREATED)
  async createAchievement(@Body() dto: CreateAchievementDto) {
    const data = await this.service.createAchievement(dto);
    return { success: true, data };
  }

  @Delete('achievements/:id')
  async deleteAchievement(@Param('id') id: string) {
    const data = await this.service.deleteAchievement(id);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 9. Milestones
  // ---------------------------------------------------------------------------
  @Get('milestones')
  async getMilestones(@Query('active') active?: string) {
    const activeBool =
      active === 'true' ? true : active === 'false' ? false : undefined;
    const data = await this.service.getMilestones(activeBool);
    return { success: true, data };
  }

  @Post('milestones')
  @HttpCode(HttpStatus.CREATED)
  async createMilestone(@Body() dto: CreateMilestoneDto) {
    const data = await this.service.createMilestone(dto);
    return { success: true, data };
  }

  @Patch('milestones/:id')
  async patchMilestone(
    @Param('id') id: string,
    @Body() dto: PatchMilestoneDto,
  ) {
    const data = await this.service.patchMilestone(id, dto);
    return { success: true, data };
  }

  @Delete('milestones/:id')
  async deleteMilestone(@Param('id') id: string) {
    const data = await this.service.deleteMilestone(id);
    return { success: true, data };
  }

  @Get('milestones/:id/progress')
  async getMilestoneProgress(@Param('id') id: string) {
    const data = await this.service.getMilestoneProgress(id);
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 10. Leaderboards
  // ---------------------------------------------------------------------------
  @Get('leaderboard/teams')
  async getTeamsLeaderboard(
    @Query('month') month?: string,
    @Query('challengeId') challengeId?: string,
  ) {
    const data = await this.service.getTeamsLeaderboard(month, challengeId);
    return { success: true, data };
  }

  @Get('leaderboard/individuals')
  async getIndividualsLeaderboard(
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
    @Query('challengeId') challengeId?: string,
  ) {
    const data = await this.service.getIndividualsLeaderboard(
      month,
      teamId,
      challengeId,
    );
    return { success: true, data };
  }

  // ---------------------------------------------------------------------------
  // 11. Winning History (Immutable)
  // ---------------------------------------------------------------------------
  @Get('winners')
  async getWinners(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.service.getWinners(year, month);
    return { success: true, data };
  }

  @Post('winners/finalize')
  @HttpCode(HttpStatus.CREATED)
  async finalizeWinners(@Body() dto: FinalizeWinnerDto) {
    const data = await this.service.finalizeWinners(dto.month);
    return { success: true, data };
  }
}

