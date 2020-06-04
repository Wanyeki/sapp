
const login_controller=require('../../login_controller')

con=login_controller.con;

exports.get_all=(callback,table)=>{
 sql="select * from "+table
 con.query(sql,(err,result)=>{
     if (err) throw err;
    callback(result)
 })
}

exports.get_groups=(index_screen)=>{
sql="select * from subject_groups";
sql2="select * from subjects where group_id > 0";
con.query(sql,(err,groups)=>{
    if(err) throw err;
    con.query(sql2,(err,subjects)=>{
        if(err) throw err;
        index_screen.webContents.send('set:groups',groups,subjects)
    })
})
}

exports.get_grading=index_screen=>{
    sql="select * from grading";
    con.query(sql,(err,result)=>{
     if (err) throw err;
         index_screen.webContents.send('set:grading',result)
 })
}

//getiin g all exams done-------------------------------




exports.get_exams_subjects=(index_screen,form,exam,term)=>{
   sql="insert into registered_exams(exam,term,finalized) values('"+exam+"','"+term+"',false)";
   sql3="select * from subjects";
   sql4="select * from exams_done where form='"+form+"' and exam='"+exam+"' and term='"+term+"'";

    con.query(sql,(err,result)=>{
        if(err){
            con.query(sql4,(err,result4)=>{
                // console.log('duplicate')
                if (err) throw err;
                index_screen.webContents.send('set:exams',result4,exam)
            })
        }else{
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
                // console.log(result3)
                result3.forEach(subject=>{
                    console.log(subject.name)
                    init_exams_done(subject.name);
                })
                   
                 setTimeout(()=>{
                      con.query(sql4,(err,result4)=>{
                    // console.log('no duplicate')
                    if (err) throw err;
                    index_screen.webContents.send('set:exams',result4,exam)
                })
                 },500)
                

            })

        }
    })

   function init_exams_done(subject){
       
      sql2="insert into exams_done(exams,exam,subject,form,term) values ";
       for(i=1;i<5;i++){
            sql2+="('1,0,0,0','"+exam+"','"+subject+"','form-"+i+"','"+term+"')"; 
            if(i<4){
                sql2+=",";
            }    
       }
        con.query(sql2,(err,result2)=>{
                if(err) throw err;
            })
    }
}

    exports.save_home_settings=(index_screen,values)=>{
        configs=['last_admission','day_lessons','term_weeks','teachers_on_duty','weekly_subject_lesson','selections_starts_at'];
        i=0;
     values.forEach(config => {
        sql="update configurations set value='"+config+"' where title='"+configs[i]+"'";
        con.query(sql,(err,result)=>{
         if (err) throw err;
            index_screen.webContents.send('close:settings');
             index_screen.webContents.send('alert:message',{type:'f-success',message:'settings saved'});
     });
     i++;
     });
    }

    exports.save_stream=(index_screen,stream)=>{
        sql="insert into streams(name) values('"+stream+"')";
        con.query(sql,(err,result)=>{
         if (err) throw err;
            index_screen.webContents.send('alert:message',{type:'f-success',message:'Stream Added'});
            callback=result=>{index_screen.webContents.send('set:streams',result)}
            table='streams'
            this.get_all(callback,table)
     })
    }

    exports.save_subject=(index_screen,subject)=>{
        sql="insert into subjects(name,has_double) values('"+subject+"',false)";
        
        con.query(sql,(err,result)=>{
         if (err) throw err;
            sql2="insert into grading(subject,value) values('"+subject+"',75)";
            con.query(sql2,(err,result3)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Subject Added'});
                callback=result2=>{index_screen.webContents.send('set:subjects',result2)}
                table='subjects'
                this.get_all(callback,table);
            });
     })
    }

    exports.update_subjects=(index_screen,subjects,values,electives)=>{
        i=0;
     values.forEach(config => {
        sql="update subjects set has_double='"+config+"',elective='"+electives[i]+"'  where name='"+subjects[i]+"'";
        con.query(sql,(err,result)=>{
         if (err) throw err;
            callback=result=>{index_screen.webContents.send('set:subjects',result)}
            table='subjects'
            this.get_all(callback,table)
             index_screen.webContents.send('alert:message',{type:'f-success',message:'subjects updated'});
     });
     i++;
     });
    }

    exports.initialize_subject_selectors=(index_screen)=>{
        callback=result=>{index_screen.webContents.send('set:subject_selectors',result)}
        table='subjects'
        this.get_all(callback,table)  
    }
    
    exports.save_group=(index_screen,group)=>{
        sql="insert into subject_groups(name) values('"+group.name+"')";
        con.query(sql,(err,result)=>{
            if(err) throw err;
                group.subjects.forEach(subject=>{
                sql="update subjects set group_id='"+result.insertId+"' where name='"+subject+"'";
                con.query(sql,(err,result)=>{
                    if(err) throw err;
                    index_screen.webContents.send('alert:message',{type:'f-success',message:'group created'});

                })
             })
        })
        
    }  

    exports.update_grading=(index_screen,subjects,values)=>{
        i=0
        values.forEach(value=>{
            get_insert(i,value)
           i++;   
        });

        function get_insert(index,value){
          
                sql2="update grading set value='"+value+"' where subject='"+subjects[index]+"'";
                con.query(sql2,(err,result)=>{
                  if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Grading Updated!'});
                })
          
        }

    }

    // update exams....................................

exports.update_exams=(index_screen,data,exam_term,form)=>{
    exam_term=exam_term.split(' ');
    for(let[key,value] of Object.entries(data)){
    sql="update exams_done set exams='"+value+"' where term='"+exam_term[1]+"' and exam='"+exam_term[0]+"' and form='"+form+"' and subject='"+key+"'";
    console.log(sql)
    con.query(sql,(err,result)=>{
        if(err) throw err;
        
        index_screen.webContents.send('alert:message',{type:'f-success',message:form+' registered!'});
    })

  }
  
}


exports.select_non_finalized_Exams=(index_screen)=>{
    sql="select * from registered_exams";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('set:registered_exams_selector',result)
    })
}

exports.init_term=(index_screen)=>{
    // console.log('brrrrrrrrrrrrrr')
    sql="select * from configurations where title='this_term' or title='prev_term'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('init:term',result)
    })
}

exports.register_term=(index_screen,term,migrate)=>{
    date=new Date;
    year=date.getFullYear()
    console.log(migrate)
      sql="update configurations set value='"+term+"' where title='this_term'";
      sql2="call increment_form();"

    con.query(sql,(err,result)=>{
        if(err) throw err;
        if(migrate){
            con.query(sql2,(err,result2)=>{
                sql4=`delete from registered_exams where term like '%${year-4}%'`;
                sql5=`delete from exams_done where term like '%${year-4}%'`
                if(err) throw err;
                con.query(sql4,(err,result4)=>{
                    if(err) throw err
                    con.query(sql5,(err,result5)=>{
                        if(err) throw err 
                        index_screen.webContents.send('close:loading');
                    })
                })
               
            }) 
         }
        index_screen.webContents.send('alert:message',{type:'f-success',message:' Term registered'});
        this.init_term(index_screen)
    })
}

exports.terminate_term=(index_screen)=>{
   

    sql3="select * from configurations where title='this_term'"
    sql="update configurations set value=0 where title='this_term'";
    con.query(sql3,(err,this_term)=>{
        if(err) throw err;
         sql2="update configurations set value='"+this_term[0].value+"' where title='prev_term'";
         con.query(sql2,(err,result2)=>{
            if(err) throw err;
            con.query(sql,(err,result)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:' Terminated'});
                this.init_term(index_screen)
                this.init_term(index_screen)
            })
        })
    })
}

exports.count_students_teachers=(index_screen)=>{
    sql=`select 
            (select count(adm) from students) as students,
            (select count(national_id) from teachers) as teachers
        `;
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('init:counts',result)
    })
}