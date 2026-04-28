import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CheckResult } from './check.entity';
import { BaseCrudService } from '../common/base-crud.service';
import { MonitoringPoint } from '../monitoring/point.entity';

@Injectable()
export class ChecksService extends BaseCrudService<CheckResult> {
  constructor(
    @InjectRepository(CheckResult) repo: Repository<CheckResult>,
    @InjectRepository(MonitoringPoint) private pointsRepo: Repository<MonitoringPoint>,
  ) {
    super(repo);
  }

  findByVisit(visitId: string) {
    return this.repo.find({ where: { visitId }, order: { checkedAt: 'DESC' } });
  }

  findByPoint(pointId: string) {
    return this.repo.find({ where: { pointId }, order: { checkedAt: 'DESC' } });
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { checkedAt: 'DESC' } });
  }

  findByObjectAndPeriod(objectId: string, from: Date, to: Date) {
    return this.repo.find({
      where: {
        objectId,
        checkedAt: Between(from, to),
      },
      order: { checkedAt: 'DESC' },
    });
  }

  async createAndUpdatePoint(data: Partial<CheckResult>): Promise<CheckResult> {
    const check = await this.create(data);

    if (data.pointId) {
      const now = new Date();
      const point = await this.pointsRepo.findOne({ where: { id: data.pointId } });
      if (point) {
        point.lastCheckedAt = now;
        const nextDue = new Date(now.getTime() + point.checkIntervalHours * 3600000);
        point.nextCheckDue = nextDue;

        if (data.equipmentStatus === 'damaged' || data.equipmentStatus === 'missing') {
          point.status = 'maintenance';
        } else if (data.activity && (data.activityLevel ?? 0) >= 3) {
          point.status = 'triggered';
        } else {
          point.status = 'active';
        }

        if (point.qrStatus === 'free' && point.tagId) {
          point.qrStatus = 'bound';
        }

        await this.pointsRepo.save(point);
      }
    }

    return check;
  }

  async getHeatmapData(objectId: string, from?: string, to?: string, pestType?: string, zone?: string) {
    const qb = this.repo.createQueryBuilder('c')
      .where('c.objectId = :objectId', { objectId });

    if (from) qb.andWhere('c.checkedAt >= :from', { from: new Date(from) });
    if (to) qb.andWhere('c.checkedAt <= :to', { to: new Date(to) });
    if (pestType) qb.andWhere('c.pestType = :pestType', { pestType });

    const checks = await qb.orderBy('c.checkedAt', 'DESC').getMany();

    const points = await this.pointsRepo.find({ where: { objectId } });
    const pointMap = new Map(points.map(p => [p.id, p]));

    const heatData: Record<string, { pointId: string; x: number; y: number; score: number; zone: string; floor: string; checks: number }> = {};

    for (const check of checks) {
      const point = pointMap.get(check.pointId);
      if (!point) continue;
      if (zone && point.zone !== zone) continue;

      if (!heatData[check.pointId]) {
        heatData[check.pointId] = {
          pointId: check.pointId,
          x: point.positionX,
          y: point.positionY,
          score: 0,
          zone: point.zone,
          floor: point.floor,
          checks: 0,
        };
      }

      const entry = heatData[check.pointId];
      entry.checks++;

      let weight = 0;
      if (check.activity) {
        weight += 2;
        weight += (check.activityLevel || 0) * 2;
      }
      if (check.consumptionPercent && check.consumptionPercent > 25) weight += 2;
      if (check.consumptionPercent && check.consumptionPercent > 50) weight += 2;
      if (check.consumptionPercent && check.consumptionPercent > 75) weight += 3;
      if (check.consumptionGrams && check.consumptionGrams > 10) weight += 2;
      if (check.consumptionGrams && check.consumptionGrams > 25) weight += 2;

      if (entry.checks > 1) weight *= 1.2;
      if (entry.checks > 3) weight *= 1.5;

      entry.score += weight;
    }

    return Object.values(heatData);
  }

  async getConsumptionReport(objectId: string, months: number = 6) {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const checks = await this.findByObjectAndPeriod(objectId, from, to);
    const points = await this.pointsRepo.find({ where: { objectId } });

    const report: Record<string, Record<string, { percent: number | null; grams: number | null; refilled: number | null }>> = {};

    for (const point of points) {
      report[point.id] = {};
    }

    for (const check of checks) {
      const monthKey = new Date(check.checkedAt).toISOString().slice(0, 7);
      if (!report[check.pointId]) report[check.pointId] = {};
      report[check.pointId][monthKey] = {
        percent: check.consumptionPercent,
        grams: check.consumptionGrams,
        refilled: check.refilledGrams,
      };
    }

    return { points, report, from: from.toISOString(), to: to.toISOString() };
  }
}
