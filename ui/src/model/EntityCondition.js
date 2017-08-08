export default class EntityCondition {
  entityId;
  not;
  comparator;
  value;

  constructor(entityId, not, comparator, value) {
    this.entityId = entityId;
    this.not = not;
    this.comparator = comparator;
    this.value = value;
  }
}
