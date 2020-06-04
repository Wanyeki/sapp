const login_controller=require('../../login_controller')

con=login_controller.con;

exports.get_students=(index_screen,data)=>{
    sql="select adm,first_name,middle_name,parent_phone,gender  from students where form='"+data.form+"' and class='"+data.class+"'";
     con.query(sql,(err,result)=>{
         if(err) throw err;
         index_screen.webContents.send('display:students',result);
         
     })
}

exports.save_student=(index_screen,data,callback=()=>false)=>{
    sql="select value from configurations where title='last_admission'";
    console.log(data)
    has_auto=false
    con.query(sql,(err,result)=>{
        if(data[0]=='auto'){
            data[0]=to_int(result[0].value);
            data[0]++;
            has_auto=true;
            console.log(data[0])
        }

        sql2="insert into students(adm,first_name,middle_name,sir_name,dob,parent_phone,kcpe,form,class,gender) values("+data[0]+",'"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"','"+data[6]+"','"+data[7]+"','"+data[8]+"','"+data[9]+"')";
        console.log(sql)
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            if(has_auto){
            sql3="update configurations set value='"+data[0]+"' where title='last_admission'";
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                this.get_students(index_screen,{form:data[7],class:data[8]})
                callback()
            })}else{
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                this.get_students(index_screen,{form:data[7],class:data[8]})
                callback()
            }
        })
    })
}

function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}
exports.delete_student=(index_screen,data)=>{
    sql="delete from students where adm='"+data.adm+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
        this.get_students(index_screen,{form:data.form,class:data.class})
    })

}

exports.update_student=(index_screen,data)=>{
    sql="update students set first_name='"+data[1]+"',middle_name='"+data[2]+"',sir_name='"+data[3]+"',dob='"+data[4]+"',parent_phone='"+data[5]+"',class='"+data[6]+"',gender='"+data[7]+"' where  adm='"+data[0]+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Updated'});
        this.get_students(index_screen,{form:data[8],class:data[6]})
        
    })
}

exports.search_student=(index_screen,data)=>{
    sql="select adm,first_name,middle_name,parent_phone,gender  from students where adm like '%"+data+"%' or first_name like '%"+data+"%' or middle_name like '%"+data+"%' or sir_name like '%"+data+"%' ";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('display:students',result);
    })
}

exports.get_update=(index_screen,data)=>{
    sql="select first_name,middle_name,sir_name,dob,parent_phone,class,gender from students where adm='"+data+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('fill:update_student',result);
    })
}


///subject registration.........................


exports.get_selections=(index_screen,data)=>{
    sql="select adm,first_name,middle_name,subjects_done from students where form='"+data.form+"' and class='"+data.class+"'";
    sql2="select name from subjects where elective=1";

    con.query(sql,(err,result)=>{
        if(err) throw err;
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            index_screen.webContents.send('display:students_selections',result,result2);
        })
    })
}

exports.update_selections=(index_screen,data)=>{
    sql="update students set subjects_done='"+data.selected_subjs+"' where adm='"+data.adm+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        this.get_selections(index_screen,{form:data.form,class:data.class})
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Updated'});
    })
}

exports.get_subj_statistics=(index_screen,form)=>{
    sql2="select name from subjects where elective=1";
    sql=" select "
    con.query(sql2,(err,result2)=>{
        if(err) throw err;
        i=1;
        result2.forEach(el => {
            sql+="(select count(adm) from students where subjects_done like '%"+el.name+"%' and form='"+form+"') as "+el.name+",";
            if(i==result2.length){
                sql=sql.slice(0,-1);
                con.query(sql,(err,result)=>{
                    if(err) throw err;
                    index_screen.webContents.send('show:selections_count',result,result2);
                })
            }
            i++;
        });
    })
}

exports.search_selection=(index_screen,data)=>{
    sql="select adm,first_name,middle_name,subjects_done  from students where adm like '%"+data+"%' or first_name like '%"+data+"%' or middle_name like '%"+data+"%' or sir_name like '%"+data+"%' ";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('display:students_selections',result);
    })
}


exports.upload_from_excell=(data,index_screen)=>{
    h=0

    next_row=()=>{
      h++
      if(h<data.length){
        console.log(h)
       let row=data[h]
       entry=[
           row[9],row[0],row[1],
           row[2],row[3],row[5],
           row[4],row[7],row[8],
           row[6]

       ]
       
        this.save_student(index_screen,entry,next_row)
    }else{
        index_screen.webContents.send('close:loading');
    }
    }

 if( data[1] && data[1].length==10){
    next_row()
 }else{
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'check your file'}) 

 }
}