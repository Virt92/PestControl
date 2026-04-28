import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/user.entity';
import { Client } from './clients/client.entity';
import { SiteObject } from './objects/object.entity';
import { MonitoringPoint } from './monitoring/point.entity';
import { Visit } from './visits/visit.entity';
import { CheckResult } from './checks/check.entity';
import { Document } from './documents/document.entity';
import { ServicePlan } from './plans/plan.entity';
import { Notification } from './notifications/notification.entity';
import { Inspection } from './inspections/inspection.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const clientRepo = app.get<Repository<Client>>(getRepositoryToken(Client));
  const objectRepo = app.get<Repository<SiteObject>>(getRepositoryToken(SiteObject));
  const pointRepo = app.get<Repository<MonitoringPoint>>(getRepositoryToken(MonitoringPoint));
  const visitRepo = app.get<Repository<Visit>>(getRepositoryToken(Visit));
  const checkRepo = app.get<Repository<CheckResult>>(getRepositoryToken(CheckResult));
  const docRepo = app.get<Repository<Document>>(getRepositoryToken(Document));
  const planRepo = app.get<Repository<ServicePlan>>(getRepositoryToken(ServicePlan));
  const notifRepo = app.get<Repository<Notification>>(getRepositoryToken(Notification));
  const inspRepo = app.get<Repository<Inspection>>(getRepositoryToken(Inspection));

  console.log('Seeding database...');

  const hash = await bcrypt.hash('admin123', 10);

  const admin = await userRepo.save(userRepo.create({
    email: 'admin@pestcontrol.ua',
    password: hash,
    fullName: 'Адмін Головний',
    role: UserRole.ADMIN,
    phone: '+380501234567',
  }));

  const auditor = await userRepo.save(userRepo.create({
    email: 'auditor@pestcontrol.ua',
    password: hash,
    fullName: 'Олена Інспектор',
    role: UserRole.AUDITOR,
    phone: '+380509876543',
  }));

  const master = await userRepo.save(userRepo.create({
    email: 'master@pestcontrol.ua',
    password: hash,
    fullName: 'Іван Майстер',
    role: UserRole.MASTER,
    phone: '+380671112233',
  }));

  const clientUser = await userRepo.save(userRepo.create({
    email: 'client@metro.ua',
    password: hash,
    fullName: 'Петро Клієнт',
    role: UserRole.CLIENT,
    phone: '+380443334455',
  }));

  console.log('Users created');

  const client1 = await clientRepo.save(clientRepo.create({
    companyName: 'МЕТРО Кеш енд Кері Україна',
    contactPerson: 'Олександр Ковальчук',
    phone: '+380442001000',
    email: 'pest@metro.ua',
    address: 'м. Київ, вул. Кільцева, 1',
    type: 'b2b',
    status: 'active',
    edrpou: '31454264',
    legalAddress: 'м. Київ, пр. Перемоги, 100',
    contacts: [
      { name: 'Олександр Ковальчук', role: 'Менеджер з безпеки', phone: '+380442001001', email: 'kovalchuk@metro.ua', comment: 'Основний контакт' },
      { name: 'Марія Петренко', role: 'Завідувач складу', phone: '+380442001002', email: 'petrenko@metro.ua', comment: 'Контакт на об\'єкті' },
    ],
    notes: 'Мережа гіпермаркетів, 12 магазинів по Україні',
  }));

  const client2 = await clientRepo.save(clientRepo.create({
    companyName: 'Ресторан "Канапа"',
    contactPerson: 'Дмитро Борисов',
    phone: '+380441234567',
    email: 'info@kanapa.ua',
    address: 'м. Київ, вул. Андріївський узвіз, 19а',
    type: 'b2b',
    status: 'active',
    edrpou: '38765432',
    contacts: [
      { name: 'Дмитро Борисов', role: 'Директор', phone: '+380441234567', email: 'borysov@kanapa.ua', comment: '' },
    ],
  }));

  const client3 = await clientRepo.save(clientRepo.create({
    companyName: 'Іваненко Сергій',
    contactPerson: 'Сергій Іваненко',
    phone: '+380509991122',
    email: 'ivanenko@gmail.com',
    address: 'м. Київ, вул. Хрещатик, 15, кв. 42',
    type: 'b2c',
    status: 'active',
  }));

  console.log('Clients created');

  const obj1 = await objectRepo.save(objectRepo.create({
    clientId: client1.id,
    name: 'МЕТРО Теремки',
    address: 'м. Київ, вул. Кільцева, 1А',
    type: 'warehouse',
    floors: 2,
    contactOnSite: 'Марія Петренко',
    contactPhone: '+380442001002',
    status: 'active',
    assignedMasterId: master.id,
    assignedAuditorId: auditor.id,
    zones: [
      { name: 'Периметр', floor: '1', description: 'Зовнішній периметр будівлі' },
      { name: 'Склад продуктів', floor: '1', description: 'Основний склад з продуктами' },
      { name: 'Завантажувальна зона', floor: '1', description: 'Зона прийому товару' },
      { name: 'Торговий зал', floor: '1', description: 'Торговий зал гіпермаркету' },
      { name: 'Кухня/Пекарня', floor: '1', description: 'Зона приготування їжі' },
      { name: 'Підвал', floor: '0', description: 'Технічне приміщення' },
    ],
  }));

  const obj2 = await objectRepo.save(objectRepo.create({
    clientId: client1.id,
    name: 'МЕТРО Троєщина',
    address: 'м. Київ, пр. Маяковського, 20',
    type: 'warehouse',
    floors: 1,
    contactOnSite: 'Василь Коваленко',
    contactPhone: '+380442001010',
    status: 'active',
    assignedMasterId: master.id,
    zones: [
      { name: 'Периметр', floor: '1', description: 'Зовнішній периметр' },
      { name: 'Склад', floor: '1', description: 'Складське приміщення' },
      { name: 'Торговий зал', floor: '1', description: '' },
    ],
  }));

  const obj3 = await objectRepo.save(objectRepo.create({
    clientId: client2.id,
    name: 'Ресторан Канапа',
    address: 'м. Київ, вул. Андріївський узвіз, 19а',
    type: 'restaurant',
    floors: 3,
    contactOnSite: 'Дмитро Борисов',
    contactPhone: '+380441234567',
    status: 'active',
    assignedMasterId: master.id,
    zones: [
      { name: 'Кухня', floor: '1', description: 'Основна кухня' },
      { name: 'Зал', floor: '1', description: 'Основний зал' },
      { name: 'Підвал/Склад', floor: '0', description: 'Винний погріб та склад' },
      { name: 'Тераса', floor: '2', description: 'Літня тераса' },
    ],
  }));

  const obj4 = await objectRepo.save(objectRepo.create({
    clientId: client3.id,
    name: 'Квартира Іваненка',
    address: 'м. Київ, вул. Хрещатик, 15, кв. 42',
    type: 'residential',
    floors: 1,
    status: 'active',
    assignedMasterId: master.id,
    zones: [
      { name: 'Кухня', floor: '1', description: '' },
      { name: 'Ванна', floor: '1', description: '' },
    ],
  }));

  console.log('Objects created');

  const pointsData = [
    { objectId: obj1.id, number: 1, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.1, positionY: 0.1, tagId: 'QR-M001-001', qrStatus: 'bound' },
    { objectId: obj1.id, number: 2, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.3, positionY: 0.1, tagId: 'QR-M001-002', qrStatus: 'bound' },
    { objectId: obj1.id, number: 3, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.5, positionY: 0.1, tagId: 'QR-M001-003', qrStatus: 'bound' },
    { objectId: obj1.id, number: 4, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.7, positionY: 0.1, tagId: 'QR-M001-004', qrStatus: 'bound' },
    { objectId: obj1.id, number: 5, type: 'trap', zone: 'Склад продуктів', floor: '1', positionX: 0.2, positionY: 0.4, tagId: 'QR-M001-005', qrStatus: 'bound' },
    { objectId: obj1.id, number: 6, type: 'trap', zone: 'Склад продуктів', floor: '1', positionX: 0.4, positionY: 0.4, tagId: 'QR-M001-006', qrStatus: 'bound' },
    { objectId: obj1.id, number: 7, type: 'trap', zone: 'Склад продуктів', floor: '1', positionX: 0.6, positionY: 0.4, tagId: 'QR-M001-007', qrStatus: 'bound' },
    { objectId: obj1.id, number: 8, type: 'control_point', zone: 'Завантажувальна зона', floor: '1', positionX: 0.8, positionY: 0.3, tagId: 'QR-M001-008', qrStatus: 'bound' },
    { objectId: obj1.id, number: 9, type: 'control_point', zone: 'Кухня/Пекарня', floor: '1', positionX: 0.3, positionY: 0.7, tagId: 'QR-M001-009', qrStatus: 'bound' },
    { objectId: obj1.id, number: 10, type: 'feeder', zone: 'Підвал', floor: '0', positionX: 0.5, positionY: 0.8, tagId: 'QR-M001-010', qrStatus: 'bound' },
    { objectId: obj1.id, number: 11, type: 'bait_station', zone: 'Торговий зал', floor: '1', positionX: 0.15, positionY: 0.6, tagId: 'QR-M001-011', qrStatus: 'bound' },
    { objectId: obj1.id, number: 12, type: 'trap', zone: 'Торговий зал', floor: '1', positionX: 0.85, positionY: 0.6, tagId: 'QR-M001-012', qrStatus: 'bound' },

    { objectId: obj2.id, number: 1, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.1, positionY: 0.15, tagId: 'QR-M002-001', qrStatus: 'bound' },
    { objectId: obj2.id, number: 2, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.5, positionY: 0.15, tagId: 'QR-M002-002', qrStatus: 'bound' },
    { objectId: obj2.id, number: 3, type: 'bait_station', zone: 'Периметр', floor: '1', positionX: 0.9, positionY: 0.15, tagId: 'QR-M002-003', qrStatus: 'bound' },
    { objectId: obj2.id, number: 4, type: 'trap', zone: 'Склад', floor: '1', positionX: 0.3, positionY: 0.5, tagId: 'QR-M002-004', qrStatus: 'bound' },
    { objectId: obj2.id, number: 5, type: 'trap', zone: 'Склад', floor: '1', positionX: 0.7, positionY: 0.5, tagId: 'QR-M002-005', qrStatus: 'bound' },
    { objectId: obj2.id, number: 6, type: 'control_point', zone: 'Торговий зал', floor: '1', positionX: 0.5, positionY: 0.8, tagId: 'QR-M002-006', qrStatus: 'bound' },

    { objectId: obj3.id, number: 1, type: 'control_point', zone: 'Кухня', floor: '1', positionX: 0.2, positionY: 0.3, tagId: 'QR-K001-001', qrStatus: 'bound' },
    { objectId: obj3.id, number: 2, type: 'control_point', zone: 'Кухня', floor: '1', positionX: 0.7, positionY: 0.3, tagId: 'QR-K001-002', qrStatus: 'bound' },
    { objectId: obj3.id, number: 3, type: 'bait_station', zone: 'Підвал/Склад', floor: '0', positionX: 0.5, positionY: 0.7, tagId: 'QR-K001-003', qrStatus: 'bound' },
    { objectId: obj3.id, number: 4, type: 'trap', zone: 'Зал', floor: '1', positionX: 0.9, positionY: 0.5, tagId: 'QR-K001-004', qrStatus: 'bound' },

    { objectId: obj4.id, number: 1, type: 'trap', zone: 'Кухня', floor: '1', positionX: 0.3, positionY: 0.4, tagId: 'QR-I001-001', qrStatus: 'bound' },
    { objectId: obj4.id, number: 2, type: 'control_point', zone: 'Ванна', floor: '1', positionX: 0.7, positionY: 0.6, tagId: 'QR-I001-002', qrStatus: 'bound' },
  ];

  const now = new Date();
  const points: MonitoringPoint[] = [];
  for (const pd of pointsData) {
    const interval = pd.type === 'bait_station' ? 72 : 168;
    const lastCheck = new Date(now.getTime() - Math.random() * 7 * 86400000);
    const nextDue = new Date(lastCheck.getTime() + interval * 3600000);
    const p = await pointRepo.save(pointRepo.create({
      ...pd,
      status: 'active',
      checkIntervalHours: interval,
      lastCheckedAt: lastCheck,
      nextCheckDue: nextDue,
    }));
    points.push(p);
  }

  console.log(`${points.length} monitoring points created`);

  const daysAgo = (d: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    return dt;
  };

  const visit1 = await visitRepo.save(visitRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    assignedTo: master.id,
    scheduledAt: daysAgo(14),
    completedAt: daysAgo(14),
    type: 'monitoring_check',
    status: 'completed',
    notes: 'Планова перевірка всіх точок',
    pointsChecked: 12,
    pointsTotal: 12,
  }));

  const visit2 = await visitRepo.save(visitRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    assignedTo: master.id,
    scheduledAt: daysAgo(7),
    completedAt: daysAgo(7),
    type: 'monitoring_check',
    status: 'completed',
    notes: 'Планова перевірка',
    pointsChecked: 12,
    pointsTotal: 12,
  }));

  const visit3 = await visitRepo.save(visitRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    assignedTo: master.id,
    scheduledAt: daysAgo(0),
    type: 'monitoring_check',
    status: 'planned',
    notes: 'Наступна перевірка',
    pointsTotal: 12,
  }));

  const visit4 = await visitRepo.save(visitRepo.create({
    objectId: obj3.id,
    clientId: client2.id,
    assignedTo: master.id,
    scheduledAt: daysAgo(3),
    completedAt: daysAgo(3),
    type: 'monitoring_check',
    status: 'completed',
    notes: 'Перевірка ресторану',
    pointsChecked: 4,
    pointsTotal: 4,
  }));

  const visit5 = await visitRepo.save(visitRepo.create({
    objectId: obj2.id,
    clientId: client1.id,
    assignedTo: master.id,
    scheduledAt: daysAgo(5),
    completedAt: daysAgo(5),
    type: 'treatment',
    status: 'completed',
    notes: 'Обробка від гризунів',
    pointsChecked: 6,
    pointsTotal: 6,
  }));

  console.log('Visits created');

  const pestTypes = ['rodents', 'cockroaches', 'ants', 'flies'];

  const obj1Points = points.filter(p => p.objectId === obj1.id);
  for (const point of obj1Points) {
    for (const visit of [visit1, visit2]) {
      const hasActivity = Math.random() > 0.6;
      const level = hasActivity ? Math.floor(Math.random() * 5) + 1 : 0;
      const consumption = point.type === 'bait_station' ? Math.floor(Math.random() * 80) : null;
      const grams = consumption ? Math.round(consumption * 0.5) : null;

      await checkRepo.save(checkRepo.create({
        visitId: visit.id,
        pointId: point.id,
        objectId: obj1.id,
        activity: hasActivity,
        activityLevel: level,
        consumptionPercent: consumption,
        consumptionGrams: grams,
        pestType: pestTypes[Math.floor(Math.random() * pestTypes.length)],
        equipmentStatus: Math.random() > 0.9 ? 'damaged' : 'ok',
        correctiveAction: hasActivity && level >= 3 ? 'Замінено приманку, додано нову станцію' : '',
        checkedBy: master.id,
        result: hasActivity ? (level >= 3 ? 'high_activity' : 'low_activity') : 'clean',
        remainingGrams: grams ? Math.max(0, 50 - grams) : null,
        refilledGrams: grams && grams > 25 ? 50 : null,
        checkedAt: visit.completedAt!,
      }));
    }
  }

  const obj3Points = points.filter(p => p.objectId === obj3.id);
  for (const point of obj3Points) {
    const hasActivity = Math.random() > 0.5;
    await checkRepo.save(checkRepo.create({
      visitId: visit4.id,
      pointId: point.id,
      objectId: obj3.id,
      activity: hasActivity,
      activityLevel: hasActivity ? Math.floor(Math.random() * 3) + 1 : 0,
      consumptionPercent: point.type === 'bait_station' ? Math.floor(Math.random() * 50) : null,
      pestType: 'cockroaches',
      equipmentStatus: 'ok',
      checkedBy: master.id,
      result: hasActivity ? 'low_activity' : 'clean',
      checkedAt: visit4.completedAt!,
    }));
  }

  console.log('Check results created');

  const inspection1 = await inspRepo.save(inspRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    type: 'initial',
    status: 'completed',
    scheduledAt: daysAgo(30),
    completedAt: daysAgo(30),
    assignedTo: auditor.id,
    checklist: [
      { question: 'Наявність щілин і отворів у стінах', answer: 'Виявлено 3 отвори біля завантажувальної зони' },
      { question: 'Стан дверних ущільнювачів', answer: 'Потребують заміни на 2 дверях' },
      { question: 'Наявність слідів гризунів', answer: 'Сліди виявлено біля складу' },
      { question: 'Стан каналізації', answer: 'Задовільний' },
      { question: 'Умови зберігання продуктів', answer: 'Відповідає нормам' },
    ],
    findings: [
      'Виявлені 3 точки проникнення гризунів на периметрі',
      'Сліди тарганів біля кухонної зони',
      'Незакриті каналізаційні отвори в підвалі',
    ],
    riskZones: ['Завантажувальна зона', 'Кухня/Пекарня', 'Підвал'],
    recommendations: [
      'Встановити 12 моніторингових точок за схемою',
      'Герметизувати отвори на периметрі',
      'Встановити щітковий ущільнювач на дверях',
      'Провести дератизацію підвалу',
    ],
    notes: 'Початкове обстеження перед укладанням договору',
  }));

  const inspection2 = await inspRepo.save(inspRepo.create({
    objectId: obj3.id,
    clientId: client2.id,
    type: 'initial',
    status: 'completed',
    scheduledAt: daysAgo(20),
    completedAt: daysAgo(20),
    assignedTo: auditor.id,
    checklist: [
      { question: 'Санітарний стан кухні', answer: 'Добрий, є зауваження щодо зони миття' },
      { question: 'Зберігання продуктів', answer: 'Відповідає нормам HACCP' },
      { question: 'Вентиляційні канали', answer: 'Потребують прочищення' },
    ],
    findings: [
      'Виявлені сліди тарганів біля зони миття',
      'Потребує додатковий захист вентканалів',
    ],
    riskZones: ['Кухня', 'Підвал/Склад'],
    recommendations: [
      'Встановити 4 моніторингові точки',
      'Прочистити вентиляцію',
      'Встановити сітки на вентканали',
    ],
  }));

  console.log('Inspections created');

  const doc1 = await docRepo.save(docRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    inspectionId: inspection1.id,
    type: 'inspection_report',
    title: 'Акт первинного обстеження — МЕТРО Теремки',
    status: 'published',
    createdBy: auditor.id,
    publishedToClient: true,
    publishedAt: daysAgo(29),
  }));

  await docRepo.save(docRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    visitId: visit2.id,
    type: 'monitoring_journal',
    title: 'Журнал моніторингу — МЕТРО Теремки — Квітень 2026',
    status: 'published',
    createdBy: admin.id,
    publishedToClient: true,
    publishedAt: daysAgo(6),
  }));

  await docRepo.save(docRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    visitId: visit2.id,
    type: 'act',
    title: 'Акт виїзду — МЕТРО Теремки — 19.04.2026',
    status: 'ready',
    createdBy: master.id,
  }));

  await docRepo.save(docRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    type: 'consumption_report',
    title: 'Звіт витрати родентициду — МЕТРО Теремки — Q2 2026',
    status: 'draft',
    createdBy: admin.id,
  }));

  await docRepo.save(docRepo.create({
    objectId: obj3.id,
    clientId: client2.id,
    inspectionId: inspection2.id,
    type: 'inspection_report',
    title: 'Акт обстеження — Ресторан Канапа',
    status: 'published',
    createdBy: auditor.id,
    publishedToClient: true,
    publishedAt: daysAgo(19),
  }));

  console.log('Documents created');

  await planRepo.save(planRepo.create({
    objectId: obj1.id,
    clientId: client1.id,
    title: 'Дератизація та моніторинг — МЕТРО Теремки',
    frequency: 'weekly',
    pestTypes: ['rodents', 'cockroaches'],
    zones: ['Периметр', 'Склад продуктів', 'Завантажувальна зона', 'Кухня/Пекарня'],
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    status: 'active',
    accessConditions: 'Вхід через прохідну, бейдж необхідний',
    workTypes: ['monitoring_check', 'treatment'],
    notes: 'Щотижневий моніторинг, обробка за потреби',
  }));

  await planRepo.save(planRepo.create({
    objectId: obj3.id,
    clientId: client2.id,
    title: 'Дезінсекція — Ресторан Канапа',
    frequency: 'biweekly',
    pestTypes: ['cockroaches', 'flies'],
    zones: ['Кухня', 'Підвал/Склад'],
    startDate: '2026-04-01',
    status: 'active',
    workTypes: ['monitoring_check'],
    notes: 'Перевірка кожні 2 тижні',
  }));

  console.log('Service plans created');

  await notifRepo.save(notifRepo.create({
    type: 'warning',
    title: 'Висока активність гризунів',
    message: 'Точка #5 (Склад продуктів): рівень активності 4 з 5',
    relatedEntity: 'point',
    relatedId: obj1Points[4]?.id || '',
    autoGenerated: true,
    triggerEvent: 'high_activity',
  }));

  await notifRepo.save(notifRepo.create({
    type: 'info',
    title: 'Виїзд завершено',
    message: 'Виїзд на МЕТРО Теремки завершено. Перевірено 12 з 12 точок.',
    relatedEntity: 'visit',
    relatedId: visit2.id,
    autoGenerated: true,
    triggerEvent: 'visit_completed',
  }));

  await notifRepo.save(notifRepo.create({
    type: 'task',
    title: 'Заплановано виїзд',
    message: 'Виїзд на МЕТРО Теремки заплановано на сьогодні',
    relatedEntity: 'visit',
    relatedId: visit3.id,
    userId: master.id,
    autoGenerated: true,
    triggerEvent: 'visit_assigned',
  }));

  await notifRepo.save(notifRepo.create({
    type: 'critical',
    title: 'Пошкоджена пастка',
    message: 'Точка #8 (Завантажувальна зона): обладнання пошкоджено',
    relatedEntity: 'point',
    relatedId: obj1Points[7]?.id || '',
    autoGenerated: true,
    triggerEvent: 'equipment_issue',
  }));

  console.log('Notifications created');
  console.log('Seed completed!');
  console.log('\nTest accounts (password: admin123):');
  console.log('  Admin:   admin@pestcontrol.ua');
  console.log('  Auditor: auditor@pestcontrol.ua');
  console.log('  Master:  master@pestcontrol.ua');
  console.log('  Client:  client@metro.ua');

  await app.close();
}

seed().catch(console.error);
