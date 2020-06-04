const login_controller=require('../../login_controller')
const school_info=require('./school_info')
con=login_controller.con;
const{dialog}=require('electron')
const ptp=require('pdf-to-printer')
let fs=require('fs')
let pdf=require('html-pdf')
let handlebars=require('handlebars')
const os =require('os')
const path=require('path')

count=0;
student_no=0;

exports.update_remarks=(index_screen,data)=>{
 sql=`insert into remarks(points,remarks) values`
 i=1;
 data.forEach(rem => {
     sql+=`(${rem.points},'${rem.remarks}'),`

     if(i==data.length){
         sql=sql.slice(0,-1);
         sql+=` on duplicate key update remarks=values(remarks)`
         con.query(sql,(err,result)=>{
             if(err) throw err
             index_screen.webContents.send('alert:message',{type:'f-success',message:'Changes saved'});
             this.get_remarks(index_screen)
         })
     }
 i++});
}

exports.get_remarks=(index_screen)=>{
    sql=`insert ignore into remarks(points,remarks) values
    (12,''),(11,''),(10,''),(9,''),(8,''),(7,''),(6,''),(5,''),(4,''),(3,''),(2,''),(1,'')`;

    sql2=`select * from remarks order by points desc`;

    con.query(sql,(err,result)=>{
        if(err) throw err;
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            index_screen.webContents.send('show:remarks',result2)
        })
    })
}


exports.generate_report=(index_screen,data)=>{
    const options={
        type:'question',
        title:'Timetable',
        message:'generate reports for '+data.form+' '+data.class+' '+data.term+'?',
        detail:'The system will use Opener and mid-term from selected term and end-term from previous term',
        buttons:['Continue','Cancel','ok']
    }
    dialog.showMessageBox(null,options).then(response=>{
        if(response.response==0){
            index_screen.webContents.send('show:loading','Generating');
		   
			sql3=`select adm,first_name,middle_name , sir_name,form,parent_phone,class from students where form='${data.form}' and class='${data.class}' `
			sql4="select * from result_class_mapping where form='"+data.form+"' and class='"+data.class+"'";
			con.query(sql4,(err,result4)=>{
				if(err) throw err;
				table=result4[0].res_table;
				con.query(sql3,(err,result3)=>{
					if(err) throw err;
                    j=1;
                    count=1;
                    student_no=result3.length;
					result3.forEach(stud=>{
						get_report_data( stud, get_report_exams(data.term),create_report,table,data.term,index_screen)
						if(j==result3.length){
							index_screen.webContents.send('cancel:loading')
						}
					j++
				})
				
				})
				
				;})
			
          
        }}
        )
}

function get_report_exams(term){
	splitted=term.split('-')
	prev_year=to_int(splitted[2])
	prev_year--;
    if(splitted[1]==1){
       return[
		   {exam:'End',term:'term-3-'+prev_year},
		   {exam:'Opener',term:term},
		   {exam:'Mid',term:term}
	   ]
    }else if (splitted[1]==2){
		return[
			{exam:'End',term:'term-1-'+splitted[2]},
			{exam:'Opener',term:term},
			{exam:'Mid',term:term}
		]

    }else if (splitted[1]==3){
		return[
			{exam:'End',term:'term-2-'+splitted[2]},
			{exam:'Opener',term:term},
			{exam:'Mid',term:term}
		]
    }
}
function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}
grades=['E','E','D-','D','D+','C-','C','C+','B-','B','B+','A-','A']
function get_report_data(student,exams,callback,table,term,index_screen){
    //top table
             sql=`select
             r.subject,
             coalesce( max(case when r.term='${exams[0].term}' and r.exam='End' then value end),0) as Endt ,
             coalesce( max(case when r.term='${exams[1].term}' and r.exam='Opener' then value end),0) as Openert ,
             coalesce( max(case when r.term='${exams[2].term}' and r.exam='Mid' then value end),0) as Midt,
             coalesce(max(case when tm.term='${term}' then tm.mean_points end),0) as mean_points,
             (select count(*)+1 from subject_term_means where av_score > tm.av_score and subject=r.subject and term=r.term and form='${student.form}' ) as rnk,
             (select count(*) from subject_term_means where subject=r.subject and term=r.term  and form='${student.form}') as out_of,
             (select remarks from remarks where points=round(tm.mean_points)) as remarks,
             get_teacher_initials(tm.class,r.form,r.subject) as teacher
     from 
     ${table} as r inner join subject_term_means as tm on tm.adm=r.adm and tm.term=r.term and tm.subject=r.subject
     
     where r.adm=${student.adm} group by r.subject;`;
              con.query(sql,(err,result)=>{
				  if(err) throw err
                   index_screen.webContents.send('set:loading_text','Processing '+student.adm)
                  for(i=0;i<result.length;i++){

                    if(result[i].teacher){
                      splitted_name=result[i].teacher.split('-')
                      result[i].teacher=splitted_name[0][0].toUpperCase()+'.'+splitted_name[1][0].toUpperCase();
                    }else{
                        result[i].teacher='X.X' 
                    }

                      result[i].grade=grades[Math.round(result[i].mean_points)]
                      result[i].mean_points=Math.round(result[i].mean_points*100)
                       result[i].mean_points/=100
                  }
                //  total term points
                sql2=`select 
                max(case when p.exam ='End' then p.total_marks end) as endt ,
                max(case when p.exam ='Opener' then p.total_marks end) as openert ,
                max(case when p.exam ='Mid' then p.total_marks end) as midt ,
                (select mean_points from students_term_means where adm= p.adm and term='${exams[2].term}') as points,
                (select count(*)+1 from students_term_means where
                mean_points>(select mean_points from students_term_means where adm=p.adm and term='${exams[2].term}') 
                and term='${exams[2].term}' and form='${student.form}' ) as rnk,
                 (select count(*) from students_term_means where term='${exams[2].term}' and form=p.form) as outof
             from student_perfomance as p 
            where 
             ((p.term='${exams[1].term}' and p.exam='Opener') or
            (p.term='${exams[0].term}' and p.exam='End') or
            (p.term='${exams[2].term}' and p.exam='Mid')) and
             p.adm=${student.adm} group by p.adm;`
             
             con.query(sql2,(err,result2)=>{
                 if(err) throw err;
                if(result2.length>0){
                 result2[0].grade=grades[Math.round(result2[0].points)]
                 //this term and last term ranks
                 sql5=`select tm.term, tm.mean_points as points,
                 (select count(*)+1 from students_term_means where mean_points>tm.mean_points and term='${exams[2].term}' and form=tm.form ) as rnk,
                 (select count(*)+1 from students_term_means where mean_points>tm.mean_points and term='${exams[2].term}' and form=tm.form and class=tm.class ) as pos,
                  (select count(*) from students_term_means where term='${exams[2].term}' and form=tm.form and class=tm.class) as class_outof,
                  (select count(*) from students_term_means where term='${exams[2].term}' and form=tm.form) as form_outof
                from students_term_means as tm where tm.adm=${student.adm} and
                (tm.term='${exams[2].term}' or tm.term='${exams[0].term}')
                group by term;`;

                con.query(sql5,(err,result5)=>{
                    if(err) throw err;
                    for(u=0;u<result5.length;u++){
                        result5[u].grade=grades[Math.round(result5[u].points)]
                        result5[u].points=Math.round(result5[u].points*100)
                         result5[u].points/=100
                    }
                    //kcpe rank
                    sql6=`select kcpe,
                    (select count(*)+1 from students where form=s.form and kcpe>s.kcpe) as rnk,
                    (select count(*)+1 from students where form=s.form and kcpe>s.kcpe and class=s.class) as pos,
                    (select count(*) from students where form=s.form) as form_outof,
                    (select count(*) from students where form=s.form and class=s.class) as class_outof
                    from students as s where adm=${student.adm};`
                    con.query(sql6,(err,result6)=>{
                        if(err) throw err;
                        result6[0].points=Math.round(kcpe_grade(result6[0].kcpe)*100)
                        result6[0].points=result6[0].points/100
                        result6[0].grade=grades[Math.round(kcpe_grade(result6[0].kcpe))]
                        result6[0].width=Math.round(kcpe_grade(result6[0].kcpe)*100/12)
                        // graph
                        sql7=`select term,mean_points from students_term_means where adm=${student.adm}
                        order by 
                     convert( concat(substring_index(substring_index(term,'-',3),'-',-1),substring_index(substring_index(term,'-',2),'-',-1)),unsigned integer) desc;`
                        con.query(sql7,(err,result7)=>{
                            if(err) throw err;
                            for(t=0;t<result7.length;t++){
                                result7[t].width=result7[t].mean_points*100/12
                            }
                            sql8=` select
                                    form,
                                    exam,
                                    term,
                                    points
                         from class_perfomance where(`
                         let all_terms=get_classes(student.form)
                         j=1
                           all_terms.forEach(trm=>{
                               //class perfomance
                               sql8+=`
                               (form='${trm[0]}' and term='${trm[1]}' )or`
                               if(j==all_terms.length){
                                
                                 sql8=sql8.slice(0,-2)                                    
                                    sql8+=` ) and class='${student.class}' group by exam,term order by 
                                    convert( concat(substring_index(substring_index(term,'-',3),'-',-1),substring_index(substring_index(term,'-',2),'-',-1)),unsigned integer) desc,
                                    case exam
                                        when  'Opener' then 1
                                        when  'Mid' then 2
                                        when  'End' then  3 end desc;
                                            `
                                           
                            con.query(sql8,(err,result8)=>{
                                if(err) throw err;
                                h=1
                                result8.forEach(res=>{
                                    res.points=Math.round(res.points*100)
                                     res.points/=100
                                    if(h==result.length){
                                        //balances
                                        sql9=`select * from balances where adm=${student.adm}` 
                                        con.query(sql9,(err,result9)=>{
                                            if(err) throw err;
                                            callback(student,result,term,index_screen,result2,result5,result6,result7,result8,result9)
                                        })
                                   }
                                h++
                            })

                            })
                                        
                        }
                        j++
                      })
    
                        })
                       
                    })
                })
            }else{
                index_screen.webContents.send('alert:message',{type:'f-danger',message:'Term not ready'})
            }
             })
              
				  
         })
    


}
function kcpe_grade(kcpe){
    per=kcpe/5
   tmp=12-((80-per)/5)
   if(tmp>=12){
       return 12
   }else if(tmp<=1){
       return 1
   }
   return tmp
}
function get_classes(form){
    let splitted=form.split('-');
    let stage=splitted[1]
        stage=to_int(stage);
 let date=new Date()
 let year=date.getFullYear()
 let terms=[]

 for(st=stage;st>0;st--){
     terms.push(['form-'+st,'term-1-'+year])
     terms.push(['form-'+st,'term-2-'+year])
     terms.push(['form-'+st,'term-3-'+year])
 
     year--
 }
 return terms
 }

function create_report(student,top_table,term,index_screen,totals_row,mid_table,kcpe_ranks,the_graph,bottom_table,balances){
    all_info=school_info.get_all()
    date=new Date()
    year=date.getFullYear();
    month=date.getMonth();
    day=date.getDay();
    tod=date.getDate()
    months=['Jan ','Feb ','March ','April ','May ','June ','July ','Aug ','Sep ','Oct ','Nov ','Dec '];
    hour=date.getHours()
    minutes=date.getMinutes()

    now=`${tod} ${months[month]} ${year} ${hour}:${minutes}`;
    let g_rows=the_graph.length;
    g_m_top=(8-g_rows)*17
    if(g_m_top<0){
        g_m_top=0
    }

	  let options={
                format:"A4",
                orientation:"portrait",
                border:"10mm"
                
            };
            let btm_data=[]
            for(i=0;i<bottom_table.length;i++){
                btm_data.push(bottom_table[i])
                if(i==7){
                    break
                }
            }

			html=fs.readFileSync(__dirname+'/print_templates/form.html','utf8')
			logo_path=__dirname
			logo_path=logo_path.replace('\\','\\\\')
			logo_path=logo_path.replace('\\assets','\\\\assets')
			logo_path=logo_path.replace('\\js','\\\\js')
            html2=handlebars.compile(html)({student:student,
                top_table:top_table,term:term,
                image:`file:\\\\\\${logo_path}\\\\print_templates\\\\logo.png`,
                school_info:all_info,
                time:now,
                totals_row:totals_row[0],
                balances:balances[0],
                mid_table0:mid_table[0],
                mid_table1:mid_table[1],
                kcpe_ranks:kcpe_ranks[0],
                val_added:Math.round( (mid_table[0].points-kcpe_ranks[0].points)*100)/100,
                g_terms:the_graph,
                btm_tab:btm_data,
                fee_tot:balances[0]?balances[0].next_term+balances[0].balance:0,
                g_m_top:g_m_top
                

            })

            pdf.create(html2,options).toFile(path.join(os.homedir(),'/Documents/report_forms/'+term+'/'+student.adm+term+'.pdf'),(err,res)=>{
				if(err) return console.log(err);
				ptp.print(res.filename).then(
					index_screen.webContents.send('set:loading_text','printing '+student.adm)
				).catch(
                    index_screen.webContents.send('alert:message',{type:'f-danger',message:'No default printer'})
					
				)
				
            });

            if(count==student_no){
                setTimeout(()=>{
                    index_screen.webContents.send('close:loading')
                    index_screen.webContents.send('generate:report_notification',path.join(os.homedir(),'/Documents/report_forms/'+term+'/'+student.adm+term+'.pdf'))
                    count=0;
                },student_no*1000)
                
            }
            count++;
}

//importing balance data

exports.upload_from_excell=(data,index_screen)=>{
    sql=`insert into balances(adm,balance,next_term) values`
    h=1
    if(data[1] && data[1].length==3){
    data.forEach(row => {
        sql+=`
        (${row[0]},${row[1]},${row[2]}),`
if(h==data.length){
    sql=sql.slice(0,-1)
    sql+=` on duplicate key update balance=values(balance) ,next_term=values(next_term)`
    con.query(sql,(err,result)=>{
        if(err) throw err;
        index_screen.webContents.send('close:loading')
    })
}
       h++ 
    });
}else{
    index_screen.webContents.send('alert:message',{type:'f-danger',message:'check your file'}) 
}
}


//view report
exports.view_report=(index_screen,data)=>{
    sql4=`select adm,first_name,middle_name , sir_name,form,parent_phone,class from students where adm='${data.adm}' `
			
			con.query(sql4,(err,result4)=>{
              if(result4.length>0)  {
				if(err) throw err;
                    sql3="select * from result_class_mapping where form='"+result4[0].form+"' and class='"+result4[0].class+"'";
                    
                    con.query(sql3,(err,result3)=>{
                        table=result3[0].res_table;
                        get_report_data( result4[0], get_report_exams(data.term),send_report_data,table,data.term,index_screen)
                    })
                 }
            })
}

function send_report_data(student,top_table,term,index_screen,totals_row,mid_table,kcpe_ranks,the_graph,bottom_table,balances){
    index_screen.webContents.send('draw:report',{
        student:student,
        top_table:top_table,
        term:term,
        totals_row:totals_row,
        mid_table:mid_table,
        kcpe_ranks:kcpe_ranks,
        the_graph:the_graph,
        bottom_table:bottom_table,
        balances:balances
    })
}
//print this


exports.print_this=(index_screen,data)=>{
			
    con.query(sql4,(err,result4)=>{
        if(err) throw err;
        if(result4.length>0)  {
              sql3="select * from result_class_mapping where form='"+result4[0].form+"' and class='"+result4[0].class+"'";
              
              con.query(sql3,(err,result3)=>{
                  table=result3[0].res_table;
                  get_report_data( result4[0], get_report_exams(data.term),create_report,table,data.term,index_screen)
                  index_screen.webContents.send('cancel:loading')
                  
              })
           }
      })
}