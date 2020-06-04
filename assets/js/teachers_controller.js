
const login_controller=require('../../login_controller')

con=login_controller.con;

exports.get_teachers=(index_screen,data)=>{
    if(data=='all'){
    sql="select national_id,first_name,last_name,title,phone from teachers";
      }else{
        sql="select national_id,first_name,last_name,title,phone from teachers where subject1='"+data+"' or subject2='"+data+"'";
    
    }con.query(sql,(err,result)=>{
         if(err) throw err;
         index_screen.webContents.send('display:teachers',result);
         
     })
   
}

exports.save_teacher=(index_screen,data)=>{
    console.log(data)
    sql="insert into teachers(national_id,first_name,last_name,title,dob,phone,subject1,subject2) values("+data[0]+",'"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"','"+data[6]+"','"+data[7]+"')";
    console.log(sql)
    con.query(sql,(err,result)=>{
        if(err) throw err;
        this.get_teachers(index_screen,data[8]);
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});

    })
}

exports.delete_teacher=(index_screen,data)=>{
    sql="delete from teachers where national_id='"+data.id+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        this.get_teachers(index_screen,data.subject);
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});

    })
}

exports.update_teacher=(index_screen,data)=>{
    sql="update teachers set first_name='"+data[0]+"',last_name='"+data[1]+"',title='"+data[2]+"',dob='"+data[3]+"',phone='"+data[4]+"',subject1='"+data[5]+"',subject2='"+data[6]+"' where national_id='"+data[8]+"'"
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('alert:message',{type:'f-success',message:'Updated'});
        this.get_teachers(index_screen,data[7])
        
    })
}

exports.get_update=(index_screen,data)=>{
    sql="select first_name,last_name,title,dob,phone,subject1,subject2 from teachers where national_id='"+data+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('fill:update_teacher',result);
    })
}

// subjects......................................................


exports.get_subject_teachers=(index_screen,form,select_mode)=>{
    sql="select subject,form,class,title from teacher_subjects where form='"+form+"' and is_group!=2";
    sql2="select name,has_double from subjects"
    sql3="select name from streams"
if(form){
 con.query(sql2,(err,result2)=>{
     if(err) throw err;
     sql4="insert ignore into teacher_subjects(subject,form,class,title,id,has_double) values";
     con.query(sql3,(err,result3)=>{
        if(err) throw err;
        i=1
        result2.forEach(subj => {
            result3.forEach(stream=>{
                sql4+="('"+subj.name+"','"+form+"','"+stream.name+"','0',0,'"+subj.has_double+"'),";
            })
            if(i==result2.length){
                insert_all(sql4);
            }
            i++;
        });
    })

 })}

 function insert_all(query){
    query=query.slice(0,-1);
    con.query(query,(err,result4)=>{
        if(err) throw err;

        con.query(sql,(err,result)=>{
            if(err) throw err
            index_screen.webContents.send('display:class_subjects',result,select_mode)
        })
    })
 }

}

exports.save_merge=(index_screen,data)=>{
    sql="update teacher_subjects set title='1' where ";
    i=1;
    all_subjects=''
 data.subjects.forEach(subj=>{
     all_subjects+=','+subj;
     sql2="insert into teacher_subjects(subject,form,class,title,id,subjects,has_double) values('"+data.name+"','"+data.form+"','group','0','0','"+all_subjects.slice(1)+"',wanyeki)";
     splited_sub=subj.split(' ')
     sql+="(subject='"+splited_sub[1]+"' and form='"+splited_sub[2]+"' and class='"+splited_sub[3]+"') or "
     sql3=" select has_double from teacher_subjects where subject='"+splited_sub[1]+"' and form='"+splited_sub[2]+"' and class='"+splited_sub[3]+"' limit 1 "
     if(i==data.subjects.length){
         sql=sql.slice(0,-3)
         all_subjects=all_subjects.slice(0,1)
        con.query(sql,(err)=>{
            if(err) throw err;
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
                sql2=sql2.replace('wanyeki',result3[0].has_double)
                con.query(sql2,(err,result2)=>{
                    if(err) throw err;
                    index_screen.webContents.send('alert:message',{type:'f-success',message:'Merged'});

                    this.get_subject_teachers(index_screen,data.form,false)
                })
        })
        })
     }
     i++;
 })
}

exports.get_teachers_for=(index_screen,subject)=>{
    if(subject=='all'){
        sql="select title,national_id from teachers";
    }else{
    sql="select title,national_id from teachers where subject1='"+subject+"' or subject2='"+subject+"'";
    }
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('set:subject_teachers',result)
    })

}

exports.save_mapping=(index_screen,data)=>{
    sql="update teacher_subjects set id='"+data.t_id+"' ,title='"+data.teacher_title+"' where form='"+data.form+"' and subject='"+data.subject+"' and class='"+data.class+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        this.get_subject_teachers(index_screen,data.form,false)

    })
}


exports.remove_mapping=(index_screen,data)=>{
    console.log(data)
    sql="update teacher_subjects set id='0' ,title='0' where form='"+data[1]+"' and subject='"+data[0]+"' and class='"+data[2]+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        this.get_subject_teachers(index_screen,data[1],false)

    })
}

exports.ungroup_class=(index_screen,data)=>{
    console.log(data)
    sql3="delete from teacher_subjects where form='"+data[1]+"' and subject='"+data[0]+"' and class='"+data[2]+"'";
    sql="select subjects from teacher_subjects where form='"+data[1]+"' and subject='"+data[0]+"' and class='"+data[2]+"'"
    con.query(sql,(err,result)=>{
        if(err) throw err;
        sql2="update teacher_subjects set title='0' where ";
        subjects=result[0].subjects.split(',')
        i=1;
        subjects.forEach(subj=>{
            splited_sub=subj.split(' ')
            sql2+="(subject='"+splited_sub[1]+"' and form='"+splited_sub[2]+"' and class='"+splited_sub[3]+"') or "
            if(i==subjects.length){
                sql2=sql2.slice(0,-3)
               con.query(sql2,(err)=>{
                   if(err) throw err;
                   con.query(sql3,(err,result3)=>{
                       if(err) throw err;
                        index_screen.webContents.send('alert:message',{type:'f-success',message:'ungrouped'});
       
                       this.get_subject_teachers(index_screen,data[1],false)
                   })
               })
            }
            i++;
        
        })
    })
}


//subject grouping......................................................................................
exports.save_grouping=(index_screen,data,tt)=>{
    console.log(data)
    subjects=''
    for(i=0;i<data.subjects.length;i++){
        subjects+=data.subjects[i]+','
    }
    sql=`select title,has_double,class,subject from teacher_subjects where title!='1' and is_group=0 and( `
    sql3=`update teacher_subjects set is_group=3 where title!='1' and is_group=0 and(`
    i=1
    data.subjects.forEach(dt=>{
        splitted=dt.split(' ')
        sql+=` (subject='${splitted[0]}' and form='${splitted[1]}') or`
        sql3+=` (subject='${splitted[0]}' and form='${splitted[1]}') or`
        if(i==data.subjects.length){
           sql= sql.slice(0,-2)
           sql3= sql3.slice(0,-2)
        sql+=')'
        sql3+=')'
           con.query(sql,(err,result)=>{
               if(err) throw err;
               has_double=0;
               shared='all'
            
               x=1
               teachers=''
               result.forEach(res=>{
                if(res.has_double==1){
                    has_double=1
                }
                if(res.class=='group'){
                    shared='group';
                }
                teachers+=res.title+','
                if(x==result.length){
                    teachers=teachers.slice(0,-1)
                    subjects=subjects.slice(0,-1)
                    sql2=`insert into teacher_subjects(subject,form,class,title,id,subjects,has_double,is_group) values(
                        '${data.group_name}','${splitted[1]}',
                        '${shared}',
                        '${teachers}',
                        0,
                        '${subjects}',
                        ${has_double},2
                    )`
                        con.query(sql2,(err,result2)=>{
                            if(err) throw err;
                            con.query(sql3,(err,result3)=>{
                                if(err) throw err;
                                tt.get_tt_subjects(index_screen)
                                index_screen.webContents.send('alert:message',{type:'f-success',message:'Combined'})
                            })

                        })
                    
                }
                x++
               })
               
           })
        }
        i++
    })

}

exports.ungroup_grouping=(index_screen,data,tt)=>{
    splitted1=data[0].split(' ')
    sql=`select * from teacher_subjects where subject='${splitted1[0]}' and form='${splitted1[1]}'`;
    sql3=`update teacher_subjects set is_group=0 where title!='1' and is_group=3 and(`
    con.query(sql,(err,result)=>{
        if(err) throw err;
        if(result[0].is_group==2){
            related_subjects=result[0].subjects.split(',')
            i=1;
            related_subjects.forEach(dt=>{
                splitted=dt.split(' ') 
                sql3+=` (subject='${splitted[0]}' and form='${splitted[1]}') or`
                if(i==related_subjects.length){
                   sql3= sql3.slice(0,-2)
                sql3+=')';
                console.log(sql3)
                con.query(sql3,(err,result3)=>{
                    if(err) throw err;
                    sql2=`delete from teacher_subjects where subject='${splitted1[0]}' and form='${splitted1[1]}'`
                    con.query(sql2,(err,result2)=>{
                        if(err) throw err;
                        tt.get_tt_subjects(index_screen)
                        index_screen.webContents.send('alert:message',{type:'f-success',message:'Combined'})
                    })
                })
            
            }
             i++
            })
           

        }else{
            index_screen.webContents.send('alert:message',{type:'f-danger',message:'Not a group'})    
        }
    })

}

exports.remove_subject=(index_screen,data)=>{
    sql=`update teacher_subjects set title='1' where subject='${data[1]}' and form='${data[2]}'`
    con.query(sql,(err,result2)=>{
        if(err) throw err;
        this.get_subject_teachers(index_screen,data[2],false)
    })

}

exports.reset_all=(index_screen,data)=>{
    sql=`delete from teacher_subjects`
    con.query(sql,(err,result2)=>{
        if(err) throw err;
        this.get_subject_teachers(index_screen,data.form,false)
    })

}