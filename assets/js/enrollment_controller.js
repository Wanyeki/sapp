const login_controller=require('../../login_controller')
con=login_controller.con;

exports.save_form1=(index_screen,data,callback=()=>false)=>{
    sql="select value from configurations where title='last_admission'";
    was_auto=false;
    con.query(sql,(err,result)=>{
        if(err) throw er
        if(data[0]=='auto'){
            data[0]=to_int(result[0].value);
            data[0]++;
            was_auto=true;
            console.log(data[0])
        }

        sql2="insert into form1(adm,first_name,middle_name,sir_name,dob,kcpe,parent_phone,gender) values("+data[0]+",'"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"','"+data[6]+"','"+data[7]+"')";
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            if(was_auto){
            sql3="update configurations set value='"+data[0]+"' where title='last_admission'";
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                this.get_form1(index_screen)
                callback()
            })}else{
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                this.get_form1(index_screen)
                callback()
            }
        })
    })

}
exports.get_form1=(index_screen)=>{
    sql="select adm,first_name,middle_name,parent_phone,kcpe  from form1 order by kcpe";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('display:form1',result);
        
    })
}

exports.delete_form1=(index_screen,data)=>{
    sql="delete from form1 where adm='"+data.adm+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
        this.get_form1(index_screen)
    })

}
exports.commit=(index_screen)=>{
    sql='select name from streams'
    sql2="select * from form1 where gender='male' order by kcpe desc"
    sql3="select * from form1 where gender='female' order by kcpe desc"
    con.query(sql,(err,streams)=>{
        if(err) throw err;
        studs=[]
        con.query(sql2,(err,males)=>{
            if(err) throw err;
            studs.push(males)
            con.query(sql3,(err,females)=>{
                if(err) throw err;
                studs.push(females)
                h=1
                studs.forEach(gender => {
                    sql4="insert into students(adm,first_name,middle_name,sir_name,dob,parent_phone,form,class,gender,kcpe) values";
                    reverse=false;
                    i=0;
                    g=1
                    gender.forEach(student=>{
                        console.log(i)
                        stream=streams[i].name;
                      sql4+="('"+student.adm+"','"+student.first_name+"','"+student.middle_name+"','"+student.sir_name+"','"+student.dob+"','"+student.parent_phone+"','form-1','"+stream+"','"+student.gender+"','"+student.kcpe+"'),"  
                      if(reverse){
                          i--
                          if(i<0){
                              reverse=false;
                              i=0
                          }
                      }else{
                          i++
                          if(i>(streams.length-1)){
                            reverse=true;
                            i--
                        }
                      }
                      if(g==gender.length){
                          insert_form1(sql4)
                      }
                      g++
                    })
                    if(h==2){
                        con.query('delete from form1',(err,result)=>{
                            if(err) throw err;
                            console.log('imported')
                            index_screen.webContents.send('alert:message',{type:'f-success',message:'Imported'});
                            this.get_form1(index_screen);
                        })
                    }
                    h++
                });
            })
    
        })

    })

    function insert_form1(query){
        query=query.slice(0,-1)
        con.query(query,(err,result5)=>{
            if(err) throw err

        })
    }


}


function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}

exports.upload_from_excell=(data,index_screen)=>{
    h=0

    next_row=()=>{
      h++
      if(h<data.length){
        console.log(h)
       let row=data[h]
       entry=[
           'auto',
           row[0],row[1],row[2],
           row[3],row[4],row[5],
           row[6]

       ]
       
        this.save_form1(index_screen,entry,next_row)
    }else{
        index_screen.webContents.send('close:loading');
    }
    }

 if( data[1] && data[1].length==7){
    next_row()
 }else{
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'check your file'}) 

 }
}