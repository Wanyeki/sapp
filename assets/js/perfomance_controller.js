
const login_controller=require('../../login_controller')
con=login_controller.con;


exports.get_results=(index_screen,data)=>{
    exam_term=data.exam.split(' ')
    exam=exam_term[0];
    term=exam_term[1];

    date=new Date;
    year=date.getFullYear();
    steps=year-to_int(term.split('-')[2])

    selected_form=to_int(data.form.split('-')[1])+steps
    absolute_form='form-'+selected_form;


    sql2="select name from subjects";
    sql3="select * from result_class_mapping where form='"+absolute_form+"' and class='"+data.class+"'";
    sql=`select
                s.adm,
                s.first_name,
                s.middle_name, `
    con.query(sql2,(err,subjects)=>{
        if(err) throw err;
        con.query(sql3,(err,result3)=>{
            exam_term=data.exam.split(' ')
            exam=exam_term[0];
            term=exam_term[1];
            i=1;
            subjects.forEach(sbj => {
                sql+=`
                coalesce(avg(case when r.subject='${sbj.name}' then r.value end),0) as ${sbj.name},`;
                if(i==subjects.length){
                    sql+=`p.total_marks,
                          p.points`;
                    sql+=` 
                            from all_results as r 
                            inner join students as s  on s.adm=r.adm 
                            inner join student_perfomance as p on r.adm=p.adm and r.exam=p.exam and r.term=p.term `;
                    if(data.class=='all'){
                        sql+=` 
                            where r.form='${data.form}' and r.exam='${exam}' and r.term='${term}' group by adm order by p.total_marks desc`;
                    }else{
                    table=result3[0].res_table;
                    sql=sql.replace('all_results',table);
                       sql+=` 
                       where r.form='${data.form}' and r.exam='${exam}' and r.term='${term}'  group by adm order by p.total_marks desc`;
                
                    }
               

                    con.query(sql,(err,result)=>{
                        if(err) throw err;
                        h=1;grades=['E','E','D-','D','D+','C-','C','C+','B-','B','B+','A-','A']
                        result.forEach(res=>{
                            res.grade=grades[Math.round(res.points)]
                            res.points=Math.round(res.points*100)
                             res.points/=100
                            if(h==result.length){
                                 index_screen.webContents.send('display:students_results',result,subjects);
                            }
                        h++
                        })
                    })

                }
                i++
            });
            
        })
       
    }) 
}


exports.search_results=(index_screen,data)=>{
    sql2="select name from subjects";
    sql=`select
                s.adm,
                s.first_name,
                s.middle_name, `;

    con.query(sql2,(err,subjects)=>{
        if(err) throw err;
           exam_term=data.exam.split(' ')
            exam=exam_term[0];
            term=exam_term[1];
            i=1;
            subjects.forEach(sbj => {
                sql+=`
                coalesce(avg(case when r.subject='${sbj.name}' then r.value end),0) as ${sbj.name},`;
                if(i==subjects.length){
                    sql+=`p.total_marks,
                          p.points`;
                    sql+=` 
                            from all_results as r 
                            inner join students as s  on s.adm=r.adm 
                            inner join student_perfomance as p on r.adm=p.adm `;
            
                        sql+=` 
                            where (s.adm like '%${data.search_text}%' or s.first_name like '%${data.search_text}%' or s.sir_name like '%${data.search_text}%' or s.middle_name like '%${data.search_text}%')
                             and r.form='${data.form}' and r.exam='${exam}' and r.term='${term}' group by adm order by p.points desc`;
                    

                    con.query(sql,(err,result)=>{
                        if(err) throw err;
                        h=1;grades=['','E','D-','D','D+','C-','C','C+','B-','B','B+','A-','A']
                        result.forEach(res=>{
                            res.grade=grades[Math.round(res.points)]
                            if(h==result.length){
                                 index_screen.webContents.send('display:students_results',result,subjects);
                            }
                        h++
                        })
                        
                    })

                }
                i++
            });
            
       
    }) 
}


//graphing.......................................


function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}
exports.get_graph1_data=(index_screen,data)=>{
   sql=`select name from streams`;
   sql2=`select 
            exam,
            term,`;
    con.query(sql,(err,result)=>{
        if(err) throw err;
        i=1;
        result.forEach(stream=>{
            sql2+=`
            max(case when class='${stream.name}' then points end ) as ${stream.name},`;
            if(i==result.length){
                sql2=sql2.slice(0,-1);
                sql2+=`
                 from class_perfomance where
                  `
                  let all_terms=get_classes(data.form)
                j=1
                  all_terms.forEach(trm=>{
                      sql2+=`
                      (form='${trm[0]}' and term='${trm[1]}' )or`
                      if(j==all_terms.length){

                        sql2=sql2.slice(0,-2)
                        sql2+=` group by exam,term
                        order by 
                     convert( concat(substring_index(substring_index(term,'-',3),'-',-1),substring_index(substring_index(term,'-',2),'-',-1)),unsigned integer),
                      case exam
						when  'Opener' then 1
						when  'Mid' then 2
						when  'End' then  3 end `;
                    
                        con.query(sql2,(err,result2)=>{
                            if(err) throw err;
                            index_screen.webContents.send('draw:graph1',result2)
                        })

                      }
                    j++
                  })

            }
            i++;
        })
    })
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


exports.get_graph2_data=(index_screen,data)=>{
    exam_term=data.exam.split(' ')
    exam=exam_term[0];
    term=exam_term[1];
   sql=`select 
   form,
   class,
   count(case when round(points)=12 then 1 end) as A2,
   count(case when round(points)=11 then 1 end) as A3,
   count(case when round(points)=10 then 1 end) as B1,
   count(case when round(points)=9 then 1 end) as B2,
   count(case when round(points)=8 then 1 end) as B3,
   count(case when round(points)=7 then 1 end) as C1,
   count(case when round(points)=6 then 1 end) as C2,
   count(case when round(points)=5 then 1 end) as C3,
   count(case when round(points)=4 then 1 end) as D1,
   count(case when round(points)=3 then 1 end) as D2,
   count(case when round(points)=2 then 1 end) as D3,
   count(case when round(points)=1 then 1 end) as E1

   from student_perfomance where form='${data.form}' and exam='${exam}' and term='${term}' group by class;`;

   con.query(sql,(err,result)=>{
       if(err) throw err;
       index_screen.webContents.send('draw:graph2',result)
   })
}


//term_results.......................................................................
function get_report_exams(term,form){
    splitted_form=form.split('-')
    splitted=term.split('-')
    prev_form=to_int(splitted[1])
    prev_form--;
	prev_year=to_int(splitted[2])
	prev_year--;
    if(splitted[1]==1){
       return[
		   {exam:'End',term:'term-3-'+prev_year,form:'form-'+prev_form},
		   {exam:'Opener',term:term,form:form},
		   {exam:'Mid',term:term,form:form}
	   ]
    }else if (splitted[1]==2){
		return[
			{exam:'End',term:'term-1-'+splitted[2],form:form},
			{exam:'Opener',term:term,form:form},
			{exam:'Mid',term:term,form:form}
		]

    }else if (splitted[1]==3){
		return[
			{exam:'End',term:'term-2-'+splitted[2],form:form},
			{exam:'Opener',term:term,form:form},
			{exam:'Mid',term:term,form:form}
		]
    }
}
//getting results
exports.get_term_results=(index_screen,data)=>{
let exams=get_report_exams(data.term,data.form)
    sql=`select
    p.adm,
    s.first_name,
    s.middle_name,
     max(case when p.exam ='End' then p.total_marks end) as endt,
     max(case when p.exam ='End' then p.points end) as endp,
     max(case when p.exam ='Mid' then p.total_marks end) as midt,
     max(case when p.exam ='Mid' then p.points end) as midp,
     max(case when p.exam ='Opener' then p.total_marks end) as Openert,
     max(case when p.exam ='Opener' then p.points end) as Openerp,
     max(case when st.term ='${data.term}' then st.mean_score end) as avs,
     max(case when st.term ='${data.term}'  then st.mean_points end) as avp
     
     from student_perfomance as p inner join students as s on p.adm=s.adm inner join students_term_means as st on st.adm=p.adm
     
     where 
      ((p.term='${exams[1].term}' and p.exam='Opener' and p.form='${data.form}') or
    (p.term='${exams[0].term}' and p.exam='End'  and p.form='${exams[0].form}') or
    (p.term='${exams[2].term}' and p.exam='Mid'  and p.form='${data.form}')) and p.class='${data.class}'
     group by p.adm order by avs desc; `
   
    con.query(sql,(err,result)=>{
        if(err) throw err;
        h=1;grades=['','E','D-','D','D+','C-','C','C+','B-','B','B+','A-','A']
        result.forEach(res=>{
            res.grade=grades[Math.round(res.avp)]
            res.avp=Math.round(res.avp*100)
            res.avp/=100
            res.endp=Math.round(res.endp*100)
            res.endp/=100
            res.Openerp=Math.round(res.Openerp*100)
            res.Openerp/=100
            res.midp=Math.round(res.midp*100)
            res.midp/=100
            if(h==result.length){
                    index_screen.webContents.send('display:term_results',result);
            }
        h++
        })

    })

}

// search term results

exports.search__results=(index_screen,data)=>{
    let exams=get_report_exams(data.term,data.form)
        sql=`select
        p.adm,
        s.first_name,
        s.middle_name,
         max(case when p.exam ='End' then p.total_marks end) as endt,
         max(case when p.exam ='End' then p.points end) as endp,
         max(case when p.exam ='Mid' then p.total_marks end) as midt,
         max(case when p.exam ='Mid' then p.points end) as midp,
         max(case when p.exam ='Opener' then p.total_marks end) as Openert,
         max(case when p.exam ='Opener' then p.points end) as Openerp,
         max(case when st.term ='${data.term}'  then st.mean_points end) as avp,
          max(case when st.term ='${data.term}' then st.mean_score end) as avs
        
         
         from student_perfomance as p inner join students as s on p.adm=s.adm inner join students_term_means as st on st.adm=p.adm
         
         where 
          ((p.term='${exams[1].term}' and p.exam='Opener' and p.form='${data.form}') or
        (p.term='${exams[0].term}' and p.exam='End'  and p.form='${exams[0].form}') or
        (p.term='${exams[2].term}' and p.exam='Mid'  and p.form='${data.form}')) and p.class='${data.class}'
         group by p.adm ; `
       
        con.query(sql,(err,result)=>{
            if(err) throw err;
            h=1;grades=['','E','D-','D','D+','C-','C','C+','B-','B','B+','A-','A']
            result.forEach(res=>{
                res.grade=grades[Math.round(res.avp)]
                if(h==result.length){
                        index_screen.webContents.send('display:term_results',result);
                }
            h++
            })
    
        })
    
    }