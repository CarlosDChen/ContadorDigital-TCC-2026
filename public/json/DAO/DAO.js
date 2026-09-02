const DAO = {

  async getAll() {
   // const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  async getById(id) {
    //const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    //const [result] = await db.query('INSERT INTO users SET ?', [data]);
    return result.insertId;
  },

  async update(id, data) {
   // const [result] = await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
    return result.affectedRows;
  },

  async delete(id) {
    //const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }

};

module.exports = DAO;