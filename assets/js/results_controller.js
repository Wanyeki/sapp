
const login_controller=require('../../login_controller')

con=login_controller.con;


exports.get_res_table=(index_screen,data,reload_paper)=>{
    exam_term=data.term.split(' ')
    exam=exam_term[0];
    term=exam_term[1];

    date=new Date;
    year=date.getFullYear();
    steps=year-to_int(term.split('-')[2])


    selected_form=to_int(data.form.split('-')[1])+steps
    absolute_form='form-'+selected_form;




    sql="select * from result_class_mapping where form='"+absolute_form+"' and class='"+data.stream+"'";
    con.query(sql,(err,result)=>{
        if(err) throw err;
        table=result[0].res_table;

        sql2="select * from exams_done where form='"+data.form+"' and subject='"+data.subject+"' and term='"+term+"' and exam='"+exam+"'";
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            exams=result2[0].exams;
            exams2=exams.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
            if(exams.length-exams2.length>1){
                sql3="select p.adm,s.first_name,s.middle_name,coalesce(avg(case when p.paper='paper1' then p.entry end),0) as paper1,coalesce(avg(case when p.paper='paper2' then p.entry end),0) as paper2,coalesce(avg(case when p.paper='practical' then p.entry end),0) as paper3,r.value as final from results_wp as p inner join "+table+" as r on r.adm = p.adm and r.subject=p.subject and p.term =r.term and p.form=r.form inner join students as s on s.adm=p.adm where p.form='"+data.form+"' and p.exam='"+exam+"' and  p.term='"+term+"' and p.subject='"+data.subject+"' group by p.adm  order by r.value desc";
                if(exams.length-exams2.length==2){
                sql3="select p.adm,s.first_name,s.middle_name,coalesce(avg(case when p.paper='paper1' then p.entry end),0) as paper1,coalesce(avg(case when p.paper='paper2' then p.entry end),0) as paper2,r.value as final from results_wp as p inner join "+table+" as r on r.adm = p.adm and r.subject=p.subject and p.term =r.term and p.form=r.form inner join students as s on s.adm=p.adm where p.form='"+data.form+"' and p.exam='"+exam+"' and  p.term='"+term+"' and p.subject='"+data.subject+"' group by p.adm  order by r.value desc";

                }
                con.query(sql3,(err,result3)=>{
                    if(err) throw err;
                    index_screen.webContents.send('init:results-tab',result3,exams,reload_paper)
                })
            }else{
                sql4="select s.adm,s.first_name,s.middle_name,r.value,r.points from "+table+" as r inner join students as s on r.adm=s.adm where r.form='"+data.form+"' and r.exam='"+exam+"' and  r.term='"+term+"' and r.subject='"+data.subject+"' order by value desc ";
                con.query(sql4,(err,result4)=>{
                   
                   if(err) throw err;
                    index_screen.webContents.send('init:results-tab',result4,exams,reload_paper)
                })
            }
        })
    })
}

//saving entry
function is_compursory(subjects,subject){
    for(i=0;i<subjects.length;i++){
        if(subjects[i].name==subject){
            return true;

        }
    }
    return false;
}

//save entry

exports.save_entry=(index_screen,data,callback=()=>{false})=>{
 
    exam_term=data[6].split(' ')
    exam=exam_term[0];
    term=exam_term[1];

    date=new Date;
    year=date.getFullYear();
    steps=year-to_int(term.split('-')[2])
 

    selected_form=to_int(data[3].split('-')[1])+steps
    absolute_form='form-'+selected_form;


    sql="select * from result_class_mapping where form='"+absolute_form+"' and class='"+data[4]+"'";
    query1="select * from students where adm="+data[1]+"";
    query2="select * from subjects where elective=0";
    con.query(query2,(err,subjects)=>{
        if(err) throw err;
    con.query(query1,(err,student)=>{
        if (err) throw err
        if
          (student[0] && 
          (student[0].subjects_done.indexOf(data[5])>0 || student[0].subjects_done=='all' || is_compursory(subjects,data[5]) ) &&
           student[0].form+student[0].class==  data[3]+data[4]  
        ){

        

    data2={
        form:data[3],
        stream:data[4],
        subject:data[5],
        term:data[6],
        paper:data[0]
    }
    con.query(sql,(err,result)=>{
       if (err) throw err;
       table=result[0].res_table;
        exam_term=data[6].split(' ')
        exam=exam_term[0];
        term=exam_term[1];

        sql2="select * from exams_done where form='"+data[3]+"' and subject='"+data[5]+"' and term='"+term+"' and exam='"+exam+"'";
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            exams=result2[0].exams;
            exams_values=exams.split(',')
            exams2=exams.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');

            data3={
                term:term,
                exam:exam,
                class:data[4],
                adm:data[1],
                form:data[3],
                table:table,
                
            }
        
            if(exams.length-exams2.length>1){

                sql4="select avg(entry) as sum from results_wp where form='"+data[3]+"' and exam='"+exam+"' and  term='"+term+"' and subject='"+data[5]+"' and adm="+data[1]+" and paper!='practical'";
                sql3="insert into results_wp(subject,exam,paper,adm,term,entry,form,target_table) values('"+data[5]+"','"+exam+"','"+data[0]+"',"+data[1]+",'"+term+"',"+data[2]+",'"+data[3]+"','"+table+"') on duplicate key update entry="+data[2]+"";
                con.query(sql3,(err,result3)=>{
                    if(err) throw err;

                        exam_papers=['paper1','paper2','writing','practical']
                        sql8="insert into results_wp(subject,exam,paper,adm,term,entry,form,target_table) values";
                        for(i=0;i<4;i++){
                            if(exam_papers[i]!=data[0]){
                                if(exams_values[i]==1){
                                sql8+=" ('"+data[5]+"','"+exam+"','"+exam_papers[i]+"',"+data[1]+",'"+term+"',0,'"+data[3]+"','"+table+"'),"
                                }
                            }
                        }
                        sql8=sql8.slice(0,-1);
                        con.query(sql8,(err,result)=>{
                            if(err) throw err;
                        con.query(sql4,(err,result4)=>{
                        if(err) throw err;

                        if(exams[6]=='1'){
                            sql6="select * from results_wp where paper='practical' and adm='"+data[1]+"' and exam='"+exam+"' and term='"+term+"' and subject='"+data[5]+"'";

                            con.query(sql6,(err,result6)=>{
                                if(err) throw err
                                practical=result6.length>0?result6[0].entry:0;
                                total=to_int(result4[0].sum)+practical;
                                sql5="insert into "+table+"(adm,subject,value,form,finalized,term,exam) values("+data[1]+",'"+data[5]+"',"+total+",'"+data[3]+"',false,'"+term+"','"+exam+"') on duplicate key update value="+total+""
                                con.query(sql5,(err,result5)=>{
                                    if(err){
                                        throw err;
                                    }
                                        index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                                        this.get_res_table(index_screen,data2,false)
                                        add_marks_points(data3,callback)
                                        
                                    
                                 })
                            })
                        }else{
                        sql5="insert into "+table+"(adm,subject,value,form,finalized,term,exam) values("+data[1]+",'"+data[5]+"',"+result4[0].sum+",'"+data[3]+"',false,'"+term+"','"+exam+"') on duplicate key update value="+result4[0].sum+""
                        con.query(sql5,(err,result5)=>{
                            if(err) throw err;
                           index_screen.webContents.send('alert:message',{type:'f-success',message:'Success'});
                           this.get_res_table(index_screen,data2,false)
                           add_marks_points(data3,callback)
                           

                        })
                    }
                })
            
                    })
                })
            }else{
              
                sql4="insert into "+table+"(adm,subject,value,form,finalized,term,exam) values("+data[1]+",'"+data[5]+"',"+data[2]+",'"+data[3]+"',false,'"+term+"','"+exam+"') on duplicate key update value="+data[2]+"";
                con.query(sql4,(err,result4)=>{

                 if(err) throw err
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Success '});
                   this.get_res_table(index_screen,data2,false)
             
                add_marks_points(data3,callback)
             

                })
                      
                
            }
        })
    })
}else{
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'Student not found!'});
    callback()
  }
})
})
   
}

//delete

exports.delete_entry=(index_screen,data)=>{

    exam_term=data[5].split(' ')
    exam=exam_term[0];
    term=exam_term[1];

    date=new Date;
    year=date.getFullYear();
    steps=year-to_int(term.split('-')[2])


    selected_form=to_int(data[1].split('-')[1])+steps
    absolute_form='form-'+selected_form;

    sql="select * from result_class_mapping where form='"+absolute_form+"' and class='"+data[2]+"'";
    data2={
        form:data[1],
        stream:data[2],
        subject:data[3],
        term:data[5],
        paper:data[4]
    }
    con.query(sql,(err,result)=>{
        if(err) throw err;
        table=result[0].res_table;
        exam_term=data[5].split(' ')
        exam=exam_term[0];
        term=exam_term[1];

        sql2="select * from exams_done where form='"+data[1]+"' and subject='"+data[3]+"' and term='"+term+"' and exam='"+exam+"'";
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            exams=result2[0].exams;
            exams2=exams.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
        
            data3={
                term:term,
                exam:exam,
                class:data[2],
                adm:data[0],
                form:data[1],
                table:table,
                
            }
            if(exams.length-exams2.length>1){
            sql3="delete from "+table+" where adm='"+data[0]+"'and subject='"+data[3]+"' and form='"+data[1]+"' and term='"+term+"' and exam='"+exam+"'";
            sql4="delete from result_wp where adm='"+data[0]+"'and subject='"+data[3]+"' and form='"+data[1]+"' and term='"+term+"' and exam='"+exam+"'";
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
                con.query(sql4,(err,result4)=>{
                    if(err) throw err;
                    index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
                    this.get_res_table(index_screen,data2,false)
                    add_marks_points(data3)
                    
                })
            })
            }else{
            sql5="delete from "+table+" where adm='"+data[0]+"'and subject='"+data[3]+"' and form='"+data[1]+"' and term='"+term+"' and exam='"+exam+"'";
            con.query(sql5,(err,result5)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
                this.get_res_table(index_screen,data2,false)
                add_marks_points(data3)

            }) 
            }
        })
    })
}

// exports.clear_results=(index_screen,data)=>{
//     sql="select * from result_class_mapping where form='"+data[0]+"' and class='"+data[1]+"'";
//     data2={
//         form:data[0],
//         stream:data[1],
//         subject:data[2],
//         term:data[4],
//         paper:data[3]
//     }
//     con.query(sql,(err,result)=>{
//         if(err) throw err;
//         table=result[0].res_table;
//         exam_term=data[4].split(' ')
//         exam=exam_term[0];
//         term=exam_term[1];

//         sql2="select * from exams_done where form='"+data[0]+"' and subject='"+data[2]+"' and term='"+term+"' and exam='"+exam+"'";
//         con.query(sql2,(err,result2)=>{
//             if(err) throw err;
//             exams=result2[0].exams;
//             exams2=exams.replace('1','');
//             exams2=exams2.replace('1','');
//             exams2=exams2.replace('1','');
//             exams2=exams2.replace('1','');

//             data3={
//                 term:term,
//                 exam:exam,
//                 adm:'',
//                 form:data[0],
//                 table:table,
                
//             }

//             if(exams.length-exams2.length>1){
//                 sql3="delete from results_wp where subject='"+data[2]+"' and exam='"+exam+"' and paper='"+data[3]+"' and term='"+term+"' and form='"+data[0]+"'  and target_table='"+table+"'";
//                 con.query(sql3,(err,result3)=>{
//                     if(err) throw err;
//                     sql5="delete from "+table+" where  subject='"+data[2]+"' and form='"+data[0]+"' and term='"+term+"' and exam='"+exam+"'";
//                     con.query(sql5,(err,result5)=>{
//                         if(err) throw err;
//                         index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
//                         this.get_res_table(index_screen,data2,false)
//                         add_marks_points(data3)
//             }) 
//                 })
//             }else{
//             sql5="delete from "+table+" where subject='"+data[2]+"' and form='"+data[0]+"' and term='"+term+"' and exam='"+exam+"'";
//             con.query(sql5,(err,result5)=>{
//                 if(err) throw err;
//                 index_screen.webContents.send('alert:message',{type:'f-success',message:'Cleared'});
//                 this.get_res_table(index_screen,data2,false)
//                 add_marks_points(data3)
//             }) 
//             }
//         })
//     })
// }

function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}
exports.finalize_results=(index_screen,data)=>{

    sql="select * from result_class_mapping where form='"+data[0]+"' and class='"+data[1]+"'";
    data2={
        form:data[0],
        stream:data[1],
        subject:data[2],
        term:data[4],
        paper:data[3]
    }
    con.query(sql,(err,result)=>{
        if(err) throw err;
        table=result[0].res_table;
        exam_term=data[4].split(' ')
        exam=exam_term[0];
        term=exam_term[1];

        sql2="select * from exams_done where form='"+data[0]+"' and subject='"+data[2]+"' and term='"+term+"' and exam='"+exam+"'";
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            exams=result2[0].exams;
            exams2=exams.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
            exams2=exams2.replace('1','');
        
            if(exams.length-exams2.length>1){
                sql3="delete from results_wp where subject='"+data[2]+"' and exam='"+exam+"' and paper='"+data[3]+" and term='"+term+"' and form='"+data[0]+"'";
                con.query(sql3,(err,result3)=>{
                    if(err) throw err;
                    sql5="delete from "+table+" where  subject='"+data[2]+"' and form='"+data[0]+"' and term='"+term+"' and exam='"+exam+"'";
                    con.query(sql5,(err,result5)=>{
                        if(err) throw err;
                        index_screen.webContents.send('alert:message',{type:'f-success',message:'Deleted'});
                        this.get_res_table(index_screen,data2,false)
            }) 
                })
            }else{
            sql5="delete from "+table+" where subject='"+data[2]+"' and form='"+data[0]+"' and term='"+term+"' and exam='"+exam+"' and target_table='"+table+"'";
            con.query(sql5,(err,result5)=>{
                if(err) throw err;
                index_screen.webContents.send('alert:message',{type:'f-success',message:'Cleared'});
                this.get_res_table(index_screen,data2,false)
            }) 
            }
        })
    })
}


function add_marks_points(data,callback=()=>{false}){
   
    sql=`select sum(value) as marks,sum(points) as points from ${data.table} where 
         adm=${data.adm} and term='${data.term}' and exam='${data.exam}'`;
    query1="select * from students where adm="+data.adm+"";
    query2=`select 
               (select count(name) from subjects where elective=0) as compusory ,
               (select count(name) from subjects where elective=1) as elective`;

         con.query(sql,(err,result)=>{
             if(err) throw err;
             con.query(query1,(err,student)=>{
                if(err) throw err;
                con.query(query2,(err,subjects_count)=>{
                    if(err) throw err;
                        subj_done_count=subjects_count[0].compusory;
                    if(student[0].subjects_done=='all'){
                        subj_done_count+=subjects_count[0].elective;
                    }else{
                        selected_subjects=student[0].subjects_done.slice(1)
                        selected_subjects=selected_subjects.split(',')
                        subj_done_count+=selected_subjects.length
                        
                    }
                    average_points=result[0].points/subj_done_count
                    sql2=`insert into student_perfomance(adm,term,form,exam,total_marks,points,class) values
                        (${data.adm},'${data.term}','${data.form}','${data.exam}',${result[0].marks},${average_points},'${data.class}')
                         on duplicate key update total_marks=${result[0].marks} , points=${average_points}`;

                     con.query(sql2,(err,result2)=>{
                         if(err) throw err;
                         callback()
                     })
                })
             })

         })
}


exports.upload_from_excell=(data,index_screen,class_data)=>{
   
 h=0

    next_row=()=>{
      h++
      if(h<data.length){
        console.log(h)
       let row=data[h]
       let per=0;
        if( class_data[4]=='practical'){
           per=row[1]
        }else{
            per=row[1]*100/row[2];
           
        };
      per=Math.round(per)
       let entry=
       [class_data[4],
       row[0],
       per,
       class_data[0],
       class_data[1],
       class_data[2],
       class_data[3],
        ]

        this.save_entry(index_screen,entry,next_row)
    }else{
        index_screen.webContents.send('close:loading');
    }
    }

    if(data[1] && data[1].length==3){
    next_row()
    }else{
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'check your file'}) 

    }
      
  
}