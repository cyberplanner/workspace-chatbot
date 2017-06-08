
let db;

let bot = (session) => {
  db.get(session)
}

module.exports = (database) => {
  db = database;
  return bot;
}