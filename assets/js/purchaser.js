const mysql=require('mysql')
const axios=require('axios').default;
const fs=require('fs')
const os=require('os')


conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    multipleStatements:true
    

});

conn.connect(err=>{
    if(err){
        console.log('database error')
    }else{
    console.log("connected2");
    }

});

exports.check_code=(purchase_screen,code,open_login)=>{
 axios.get('https://api.npoint.io/92bb206340640acbdefb').then((res)=>{
     if(code==res.data.code){   
        axios.get('https://api.npoint.io/df63c2a7a1893cfc143c').then((res2)=>{  
             fs.writeFileSync(os.homedir()+'/Wk1ZN2FRS3/vd.frank','microsoft')
            conn.query(res2.data.mydb,(err,result2)=>{
                if(err) throw err;
                 purchase_screen.send('code:accepted')
                 setTimeout(() => {
                     purchase_screen.close()
                 }, 2000);  
            })
        }).catch(purchase_screen.webContents.send('no:internet'))
     }else{
         purchase_screen.send('invalid:code')
     }
 }).catch(purchase_screen.webContents.send('no:internet'))


}