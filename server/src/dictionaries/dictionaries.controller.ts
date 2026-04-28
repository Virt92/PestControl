import { Controller, Get } from '@nestjs/common';

@Controller('dictionaries')
export class DictionariesController {
  @Get('pest-types')
  getPestTypes() {
    return [
      { id: 'rodents', name: 'Гризуни', icon: '🐀' },
      { id: 'cockroaches', name: 'Таргани', icon: '🪳' },
      { id: 'ants', name: 'Мурахи', icon: '🐜' },
      { id: 'flies', name: 'Мухи', icon: '🪰' },
      { id: 'mosquitoes', name: 'Комарі', icon: '🦟' },
      { id: 'bedbugs', name: 'Клопи', icon: '🐛' },
      { id: 'moths', name: 'Молі', icon: '🦋' },
      { id: 'birds', name: 'Птахи', icon: '🐦' },
      { id: 'stored_product', name: 'Шкідники запасів', icon: '🪲' },
    ];
  }

  @Get('point-types')
  getPointTypes() {
    return [
      { id: 'trap', name: 'Пастка', description: 'Механічна пастка для гризунів' },
      { id: 'bait_station', name: 'Приманкова станція', description: 'Станція з приманкою' },
      { id: 'feeder', name: 'Годівниця', description: 'Годівниця з отрутою' },
      { id: 'control_point', name: 'Контрольна точка', description: 'Клейова пастка / феромонна' },
      { id: 'uv_trap', name: 'УФ-пастка', description: 'Ультрафіолетова пастка для літаючих' },
      { id: 'pheromone_trap', name: 'Феромонна пастка', description: 'Феромонна пастка' },
    ];
  }

  @Get('check-results')
  getCheckResults() {
    return [
      { id: 'clean', name: 'Чисто', severity: 0, color: '#22c55e' },
      { id: 'trace', name: 'Сліди', severity: 1, color: '#eab308' },
      { id: 'low_activity', name: 'Низька активність', severity: 2, color: '#f97316' },
      { id: 'medium_activity', name: 'Середня активність', severity: 3, color: '#ef4444' },
      { id: 'high_activity', name: 'Висока активність', severity: 4, color: '#dc2626' },
      { id: 'critical', name: 'Критично', severity: 5, color: '#991b1b' },
    ];
  }

  @Get('equipment-statuses')
  getEquipmentStatuses() {
    return [
      { id: 'ok', name: 'Справне' },
      { id: 'damaged', name: 'Пошкоджене' },
      { id: 'missing', name: 'Відсутнє' },
      { id: 'needs_replacement', name: 'Потребує заміни' },
      { id: 'contaminated', name: 'Забруднене' },
    ];
  }

  @Get('visit-types')
  getVisitTypes() {
    return [
      { id: 'inspection', name: 'Обстеження' },
      { id: 'treatment', name: 'Обробка' },
      { id: 'monitoring_check', name: 'Перевірка точок' },
      { id: 'follow_up', name: 'Контрольний виїзд' },
      { id: 'emergency', name: 'Екстрений виїзд' },
    ];
  }

  @Get('document-types')
  getDocumentTypes() {
    return [
      { id: 'act', name: 'Акт виїзду' },
      { id: 'monitoring_journal', name: 'Журнал моніторингу' },
      { id: 'report', name: 'Звіт' },
      { id: 'service_plan', name: 'План обслуговування' },
      { id: 'inspection_report', name: 'Акт обстеження' },
      { id: 'consumption_report', name: 'Звіт витрати' },
      { id: 'recommendation', name: 'Рекомендації' },
      { id: 'contract', name: 'Договір' },
    ];
  }

  @Get('object-types')
  getObjectTypes() {
    return [
      { id: 'warehouse', name: 'Склад' },
      { id: 'production', name: 'Виробництво' },
      { id: 'office', name: 'Офіс' },
      { id: 'restaurant', name: 'Ресторан/кафе' },
      { id: 'hotel', name: 'Готель' },
      { id: 'retail', name: 'Магазин' },
      { id: 'residential', name: 'Житлове приміщення' },
      { id: 'hospital', name: 'Медичний заклад' },
      { id: 'school', name: 'Навчальний заклад' },
      { id: 'food_processing', name: 'Харчове виробництво' },
    ];
  }

  @Get('zones')
  getZones() {
    return [
      { id: 'perimeter', name: 'Периметр' },
      { id: 'loading_dock', name: 'Завантажувальна зона' },
      { id: 'kitchen', name: 'Кухня' },
      { id: 'storage', name: 'Складське приміщення' },
      { id: 'production_hall', name: 'Виробничий цех' },
      { id: 'office_area', name: 'Офісна зона' },
      { id: 'basement', name: 'Підвал' },
      { id: 'attic', name: 'Горище' },
      { id: 'garbage', name: 'Сміттєзбірник' },
      { id: 'entry_point', name: 'Точка входу' },
    ];
  }
}
