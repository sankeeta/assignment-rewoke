const db = require('../db')

module.exports = class Comment {

    constructor(comment,user_id,post_id,deleted=0,created_at = new Date()){
        this.comment = comment;
        this.user_id = user_id,
        this.post_id = post_id,
        this.deleted = deleted;
        this.created_at = created_at;
    }

    save() {
        return db.query(
          'INSERT INTO comments (id,comment,  user_id,post_id,deleted, created_at) VALUES (?,?,?,?,?,?)',
          [null,this.comment, this.user_id, this.post_id,this.deleted,this.created_at]
        );
    }

    static async count(){
        const conn = await db.getConnection();
        const [rows, fields] = await  conn.query(`SELECT COUNT(id) as count FROM comments WHERE deleted = 0`);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0].count;
    }

    static async find(selectfield,param,join,order_by,limit,offset) {
        let select = "";
        let joinquery = "";
        let wherequery = ""
        const conn = await db.getConnection();
        const keys = Object.keys(param);
        const values = Object.values(param);
        let query = '';
        
        if(selectfield.length){
            for(let val in selectfield) {
                    console.log(`${val} : ${selectfield[val]}`);
                    if(select)
                        select = select + `, ${selectfield[val]} `
                    else
                    select =  `${selectfield[val]}`
                }
        }
        else{
            select = "*";
        }
        /** Join Query */
        if(!(Object.keys(join).length === 0)){
            for (let key in join) {
                if (join.hasOwnProperty(key)) {
                    console.log(`${key} : ${join[key]}`);
                    joinquery = `${joinquery} JOIN ${key} ON comments.${join[key]} = ${key}.id`
                }
            }
        }
         /** Where conditions */
        for(let i=0; i<keys.length ;i++) {
            let key = keys[i];
            if(wherequery){
                wherequery = `${wherequery} , comments.${key} = ?`
            }
            else{
                wherequery = `AND comments.${key} = ?`
            }
        }
        if(order_by){
            query = `${query} ORDER BY ${order_by}`
        }
        else{
            query = `${query} ORDER BY comments.id DESC`
        }
        if(limit){
            query = `${query} LIMIT ${limit}`
        }
        if(offset){
            query = `${query} OFFSET ${offset}`
        }
        let sqlquery = `SELECT ${select} FROM comments ${joinquery} WHERE comments.deleted = 0 ${wherequery} ${query}`;
        console.log('sqlquery : ',sqlquery)
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
                query = query +' AND comments.'+ key+' = ?'
            }
            else{
                query = 'AND comments.'+ key+' = ?'
            }
        }
        let sqlquery = `SELECT * FROM comments WHERE deleted = 0 ${query} ORDER BY id ASC LIMIT 1`;
        const [rows, fields] = await conn.query(sqlquery,values);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0];
    }

    static async findById(id){
        const conn = await db.getConnection();
        const [rows, fields] = await conn.query(`SELECT * FROM comments WHERE deleted = 0 AND comments.id = ?`,[id]);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0];
    }

    static delete(id){
        return db.query('UPDATE comments SET deleted=1 WHERE deleted=0 AND comments.id = ?',[id]);
    }
}