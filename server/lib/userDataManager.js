const addEntitiesToUserData = (userData, entities) => {
  entities.forEach(entity => {
    userData[entity.type] = entity.entity;
  });
};

module.exports = {
  addEntitiesToUserData
};
