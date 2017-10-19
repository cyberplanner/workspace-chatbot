const addEntitiesToUserData = (userData, entities) => {
  if (entities) {
    entities.forEach(entity => {
      userData[entity.type] = entity.entity;
    });
  }
};

module.exports = {
  addEntitiesToUserData
};
