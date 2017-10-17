export default class EntityCondition {
  entityId;
  not;
  comparator;
  value;
  caseSensitive;

  constructor(entityId, not, comparator, value, caseSensitive) {
    this.entityId = entityId;
    this.not = not;
    this.comparator = comparator;
    this.value = value;
    this.caseSensitive = Boolean(caseSensitive);
  }
}
