const db = require('../db')

module.exports = class Post {

    constructor(content,image,user_id,deleted=0,created_at = new Date()){
        this.content = content;
        this.image = image;
        this.user_id = user_id,
        this.deleted = deleted;
        this.created_at = created_at;
    }

    save() {
        return db.query(
          'INSERT INTO post (id,content, image, user_id,deleted, created_at) VALUES (?,?,?,?,?,?)',
          [null,this.content, this.image, this.user_id,this.deleted,this.created_at]
        );
    }

    static async count(){
        const conn = await db.getConnection();
        const [rows, fields] = await  conn.query(`SELECT COUNT(id) as count FROM post WHERE deleted = 0`);
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
                    joinquery = `${joinquery} JOIN ${key} ON post.${join[key]} = ${key}.id`
                }
            }
        }
         /** Where conditions */
        for(let i=0; i<keys.length ;i++) {
            let key = keys[i];
            if(wherequery){
                wherequery = `${wherequery} , post.${key} = ?`
            }
            else{
                wherequery = `AND post.${key} = ?`
            }
        }
        if(order_by){
            query = `${query} ORDER BY ${order_by}`
        }
        else{
            query = `${query} ORDER BY post.id DESC`
        }
        if(limit){
            query = `${query} LIMIT ${limit}`
        }
        if(offset){
            query = `${query} OFFSET ${offset}`
        }
        let sqlquery = `SELECT ${select} FROM post ${joinquery} WHERE post.deleted = 0 ${wherequery} ${query}`;
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
                query = query +' AND post.'+ key+' = ?'
            }
            else{
                query = 'AND post.'+ key+' = ?'
            }
        }
        let sqlquery = `SELECT * FROM post WHERE deleted = 0 ${query} ORDER BY id ASC LIMIT 1`;
        const [rows, fields] = await conn.query(sqlquery,values);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0];
    }

    static async findById(id){
        const conn = await db.getConnection();
        const [rows, fields] = await conn.query(`SELECT * FROM post WHERE deleted = 0 AND post.id = ?`,[id]);
        conn.release();
        const result = Object.values(JSON.parse(JSON.stringify(rows)));
        return result[0];
    }

    static async updateOne(id,updateparam){
        let updateqoery = ''
        if(!(Object.keys(updateparam).length === 0)){
            for (let key in updateparam) {
                if (updateparam.hasOwnProperty(key)) {
                    if(updateqoery){
                        updateqoery = `${updateqoery},${key} = "${updateparam[key]}"`
                    }
                    else
                    updateqoery = `${key} = "${updateparam[key]}"`
                }
            }
        }
        return db.query(`UPDATE post SET ${updateqoery} WHERE deleted = 0 AND post.id = ?`,[id]);
    }

    static delete(id){
        return db.query('UPDATE post SET deleted=1 WHERE deleted=0 AND post.id = ?',[id]);
    }
}