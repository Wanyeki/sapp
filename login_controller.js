const mysql = require('mysql');
const fs=require('fs')
const bcrypt= require('bcryptjs');
const os=require('os')
var path=require('path')
exports.session_id;
exports.Username;
    exports.con=mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"",
        database:"school_management"

    });
con=this.con;
    con.connect(err=>{
        if(err){
            console.log('database error')
        }else{
        console.log("connected");
        }
    
    })


exports.login=(form_data,open_index,login_screen)=>{
    sql="select * from users where username='"+form_data.username+"' ";

    con.query(sql,(err,result)=>{
        if (err) throw error; 
        if(result.length==1){
        result.forEach(user => {
            bcrypt.compare(form_data.password,user.enc_password,(err,is_match)=>{
                if(err) throw error;
                if(is_match){
                    open_index()
                    login_screen.close();
                    this.session_id=user.id;
                    this.Username=user.username;
                    console.log(this.session_id)
                }else{
                    console.log('invalid')
                    login_screen.webContents.send('show:error')
                }
            })
        });}else{
            console.log('invalid')
            login_screen.webContents.send('show:error');

        }

    })
  
}


exports.create_user=(form_data,management_screen,index_screen)=>{
bcrypt.genSalt(10,(err,salt)=>{
    if(err) throw err;
    bcrypt.hash(form_data.password,salt,(err,hash)=>{
        if(err) throw err;
        
        let sql="insert into users(username,enc_password) values('"+form_data.username+"','"+hash+"')";
        con.query(sql,(err,result)=>{
           if(err) throw err;
            this.list_users(management_screen);
            index_screen.webContents.send('alert:message',{type:'f-success',message:'User added'})  

             console.log('inserted');
        })
    })
})


}

exports.remove_user=(id,index_screen)=>{
    if(id!=this.session_id){
    sql="delete from users where id ='"+id+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('alert:message',{type:'f-success',message:'User removed'})  
    })
}else if(id==0){
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'You cant remove the DEVELOPER !'})  
}

else{
 index_screen.webContents.send('alert:message',{type:'f-danger',message:'You cant remove yourself!'})
}
}

exports.change_password=(form_data,index_screen)=>{
    sql="select * from users where id='"+this.session_id+"' ";

    con.query(sql,(err,result)=>{
        if (err) throw error; 
        result.forEach(user => {
            bcrypt.compare(form_data.old,user.enc_password,(err,is_match)=>{
                if(err) throw error;
                if(is_match){
                    bcrypt.genSalt(10,(err,salt)=>{
                        if(err) throw err;
                        bcrypt.hash(form_data.new,salt,(err,hash)=>{
                            if(err) throw err;
                            
                            let sql="update users set enc_password='"+hash+"' where id ='"+this.session_id+"'";
                            con.query(sql,(err,result)=>{
                               if(err) throw err;
                                 index_screen.webContents.send('alert:message',{type:'f-success',message:'password changed'})
                                
                            })
                        })
                    })
                }else{
                    index_screen.webContents.send('alert:message',{type:'f-danger',message:'wrong password'})
                }
            })
        });

    })
}

exports.list_users= (management_screen)=>{
    
    sql="select id,username from users;"
    con.query(sql,(err,result)=>{
        if (err) throw err;
        management_screen.webContents.send('display:userTable',result)
    })
}

exports.is_valid=()=>{
    
    if(fs.existsSync(path.join(os.homedir()+'/Wk1ZN2FRS3/vd.frank'))){
        contents=fs.readFileSync(os.homedir()+'/Wk1ZN2FRS3/vd.frank','utf8',)
        if(contents=="microsoft"){
            return true;
        }
        else{
         
            return false;
        }
   
    }else{
        fs.mkdirSync(os.homedir()+'/Wk1ZN2FRS3')
        fs.writeFileSync(os.homedir()+'/Wk1ZN2FRS3/vd.frank','utf8')
        return false
    }
   }