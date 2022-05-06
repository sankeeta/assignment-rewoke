const db = require('../db')

module.exports = class User {
    
    constructor(name,email,password,deleted=0,created_at = new Date()){
        this.name = name;
        this.email = email;
        this.password = password,
        this.deleted = deleted;
        this.created_at = created_at;
    }

    save() {
        return db.query(
          'INSERT INTO user (id,name, email, password,deleted, created_at) VALUES (?,?,?,?,?,?)',
          [null,this.name, this.email, this.password,this.deleted,this.created_at]
        );
      }

    static async find(param) {
        const conn = await db.getConnection();
        const keys = Object.keys(param);
        const values = Object.values(param);
        let query = '';
        for(let i=0; i<keys.length ;i++) {
            let key = keys[i];
            if(query){
                query = query +', user.'+ key+' = ?'
            }
            else{
                query = 'user.'+ key+' = ?'
            }
        }
        let sqlquery = `SELECT * FROM user WHERE ${query}`;
        const [rows, fields] = await conn.query(sqlquery,values);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result;
    }

    static async findOne(param) {
        const conn = await db.getConnection();
        const keys = Object.keys(param);
        const values = Object.values(param);
        let query = '';
        for(let i=0; i<keys.length ;i++) {
            let key = keys[i];
            if(query){
                query = query +', user.'+ key+' = ?'
            }
            else{
                query = 'user.'+ key+' = ?'
            }
        }
        let sqlquery = `SELECT * FROM user WHERE ${query} ORDER BY id ASC LIMIT 1`;
        const [rows, fields] = await conn.query(sqlquery,values);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0];
    }

    static fetchById(id){
        return db.execute('SELECT * FROM user WHERE user.id = ?',[id]);
    }
}