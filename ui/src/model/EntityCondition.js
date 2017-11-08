export default class EntityCondition {
  entityId;
  not;
  comparator;
  value;
  caseSensitive;
  checkUserData;

  constructor(entityId, not, comparator, value, caseSensitive, checkUserData) {
    this.entityId = entityId;
    this.not = not;
    this.comparator = comparator;
    this.value = value;
    this.caseSensitive = Boolean(caseSensitive);
    this.checkUserData = Boolean(checkUserData);
  }
}
