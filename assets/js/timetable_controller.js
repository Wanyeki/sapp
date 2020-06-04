const Genetic=require('genetic-js')
const login_controller=require('../../login_controller')
con=login_controller.con;
const {dialog} = require('electron');
const seeding=require('./timetabling/seeding')
const fitness=require('./timetabling/fitness')
const mutate=require('./timetabling/mutate')
const crossover=require('./timetabling/crossover')
const path=require('path')
const fs=require('fs')

exports.get_tt=(index_screen,data)=>{
    if(data.timetable=='1' && data.type=='1'){
        sql=`
        select 
        t_day,
        max(case when t_slot='1' then concat(subject,',',teacher_title,',',is_double) end) as t1,
        max(case when t_slot='2' then concat(subject,',',teacher_title,',',is_double) end) as t2,
        max(case when t_slot='3' then concat(subject,',',teacher_title,',',is_double) end) as t3,
        max(case when t_slot='4' then concat(subject,',',teacher_title,',',is_double) end) as t4,
        max(case when t_slot='5' then concat(subject,',',teacher_title,',',is_double) end) as t5,
        max(case when t_slot='6' then concat(subject,',',teacher_title,',',is_double) end) as t6,
        max(case when t_slot='7' then concat(subject,',',teacher_title,',',is_double) end) as t7,
        max(case when t_slot='8' then concat(subject,',',teacher_title,',',is_double) end) as t8,
        max(case when t_slot='9' then concat(subject,',',teacher_title,',',is_double) end) as t9
        from teaching_timetable where form='${data.form}' and class='${data.class}' group by t_day 
        order by case t_day
                    when 'Mon' then 1
                    when 'Tue' then 2
                    when 'Wed' then 3
                    when 'Thu' then 4
                    when 'Fri' then 5
                    end
                    ;
        `;
    }else if(data.timetable=='2' && data.type=='1'){
        sql=`
        select 
            t_day,
            max(case when t_slot='0' then concat(subject,',',teacher_title,',',practical) end) as morning, 
            max(case when t_slot='1' then concat(subject,',',teacher_title,',',practical) end) as mid_morning,
            max(case when t_slot='2' then concat(subject,',',teacher_title,',',practical) end) as afternoon
        from exam_timetable where form='${data.form}'  group by t_day;`;
    }else if(data.timetable=='3'){
        sql="select * from teachers_on_duty order by t_slot"
    }else if(data.timetable=='1' && data.type=='2'){
        sql=`
        select 
        t_day,
        max(case when t_slot='1' then concat(subject,',',form,',',is_double,',',class) end) as t1,
        max(case when t_slot='2' then concat(subject,',',form,',',is_double,',',class) end) as t2,
        max(case when t_slot='3' then concat(subject,',',form,',',is_double,',',class) end) as t3,
        max(case when t_slot='4' then concat(subject,',',form,',',is_double,',',class) end) as t4,
        max(case when t_slot='5' then concat(subject,',',form,',',is_double,',',class) end) as t5,
        max(case when t_slot='6' then concat(subject,',',form,',',is_double,',',class) end) as t6,
        max(case when t_slot='7' then concat(subject,',',form,',',is_double,',',class) end) as t7,
        max(case when t_slot='8' then concat(subject,',',form,',',is_double,',',class) end) as t8,
        max(case when t_slot='9' then concat(subject,',',form,',',is_double,',',class) end) as t9
        from teaching_timetable where teacher_title like '%${data.teacher}%' group by t_day 
        order by case t_day
        when 'Mon' then 1
        when 'Tue' then 2
        when 'Wed' then 3
        when 'Thu' then 4
        when 'Fri' then 5
        end;
        `
    }else if(data.timetable=='2' && data.type=='2'){
        sql=`
        select 
        t_day,
            max(case when t_slot='1' then concat(subject,',',form,',',practical) end) as morning, 
            max(case when t_slot='2' then concat(subject,',',form,',',practical) end) as mid_morning,
            max(case when t_slot='3' then concat(subject,',',form,',',practical) end) as afternoon
        from exam_timetable where teacher_title='${data.teacher}'  group by t_day;
        `
    }
        sql2="select title from teachers";
        con.query(sql,(err,result)=>{
            if(err) throw err;
            con.query(sql2,(err,result2)=>{
                if(err) throw err
                index_screen.webContents.send('show:tt',result,data.timetable,result2)
            })
        })
}


exports.get_tt_subjects=(index_screen)=>{

    sql=`select name from streams`
    con.query(sql,(err,result)=>{
        if(err) throw err;
        sql2=`select subject,form,class,has_double from teacher_subjects where (class='${result[0].name}' or class='group' or class='all') and title!='1' and is_group!=3`
        console.log(sql2)
        con.query(sql2,(err,result2)=>{
            if(err) throw err;
            index_screen.webContents.send('init_tt_subjects',result2)
        })
    })
}
exports.generate_exams=(index_screen,exam)=>{
   
    exam_term=exam.split(' ')
    exam=exam_term[0];
    term=exam_term[1];
    const options = {
        type: 'question',
        title: 'Timetables',
        message: "Generate Exam timetable?",
        buttons: ['continue','cancel'],
       
      }
      dialog.showMessageBox(null,options).then(response=>{
            if(response.response==0){
                index_screen.send('show:loading','Generating')
                exam_papers=['paper1','paper2','writing','practical']
                sql=`select * from exams_done where exam='${exam}' and term='${term}'`
                con.query(sql,(err,result)=>{
                    if(err) throw err;
                    
                    subjects=[]
                    for(i=1;i<5;i++){
                        form_sbs=[]
                        fm='form-'+i
                        sbs=result.filter(sb=>sb.form==fm)
                        for(j=0;j<sbs.length;j++){
                            papers=sbs[j].exams.split(',')
                            
                            for(k=0;k<papers.length;k++){
                                if(papers[k]=='1'){
                                    pp={}
                                    pp.form=fm;
                                    pp.subject=sbs[j].subject
                                    pp.paper=exam_papers[k]
                                    form_sbs.push(pp)
                                }
                            }


                        }

                      subjects.push(form_sbs)  

                    }

                    sql=`select * from streams`;
                    sql2=`select title ,subject1 , subject2 from teachers`
                    con.query(sql,(err,result1)=>{
                        if(err) throw err;
                        con.query(sql2,(err,result2)=>{
                            if(err) throw err;
                            
                            create_exam_tt(subjects,result1,result2,index_screen)
                        })
                    })
                    
        })
}
})
}
function create_exam_tt(subjects,streams,teachers,index_screen){
    sb_teachers=streams.length+1
    no_teachers=teachers.length;
    assigned=[]
    
    //practical
    day=1
    while(subjects[0].length>0 || subjects[1].length>0 || subjects[2].length>0 || subjects[3].length>0){
       

         for(j=0;j<3;j++){
             slot_teachers=[]
            for(i=0;i<subjects.length;i++){
                if(subjects[i].length>0){
                    idx=Math.floor(Math.random()*subjects[i].length)
                    sbj=subjects[i][idx]
                    sbj.teachers=[]
                    sbj.slot=j
                    sbj.day='day-'+day
                        tcrs=teachers.filter(su=>su.subject1==sbj.subject || su.subject2==sbj.subject);
                        pushed=0
                        l=0
                        while(pushed<sb_teachers){
                            if(l<tcrs.length){
                               if(slot_teachers.indexOf(tcrs[l].title)<0){
                                pushed++;
                                slot_teachers.push(tcrs[l].title)
                                sbj.teachers.push(tcrs[l].title)
                               }
                            }else{
                                idx2=Math.floor(Math.random()*teachers.length)
                                if(slot_teachers.indexOf(teachers[idx2].title)<0){
                                    pushed++;
                                    slot_teachers.push(teachers[idx2].title)
                                    sbj.teachers.push(teachers[idx2].title)
                                   }
                            }

                            l++
                        }
                    
                    assigned.push(sbj)
                    subjects[i].splice(idx,1)
            }
         }
    }
        day++
    }

    save_exam_tt(assigned,index_screen)

}
function save_exam_tt(tt,index_screen){
    sql=`insert into exam_timetable(form,t_day,t_slot,subject,teacher_title,practical) values`
        for(i=0;i<tt.length;i++){
        sql+=`( '${tt[i].form}','${tt[i].day}','${tt[i].slot}','${tt[i].subject},${tt[i].paper}','${tt[i].teachers}',${tt[i].paper=='practical'?1:0}),`
     }
     sql=sql.slice(0,-1)
     con.query(sql,(err,res)=>{
         if(err) throw err;
         index_screen.send('close:loading')
         index_screen.webContents.send('open:timetables','2')
     })
    
}

exports.generate_onduty=(index_screen)=>{
    no_teachers=2
    no_slots=12
    no_teachers=no_teachers*no_slots
    const options = {
        type: 'question',
        title: 'Timetables',
        message: "Generate Duty Roster?",
        buttons: ['continue','cancel'],
       
      }
      dialog.showMessageBox(null,options).then(response=>{
        if(response.response==0){
            index_screen.send('show:loading','Generating')
            sql=`select title from teachers`
            con.query(sql,(err,result)=>{
                if (err) throw err
                all_teachers=result.length
                if(all_teachers<no_teachers){
                    additional_teachers=[]
                    remaining=no_teachers-all_teachers;
                    for(i=0;i<remaining;i++){
                        additional_teachers.push(result[i])
                    }
                    result=result.concat(additional_teachers)
                }
                sql2=`insert into teachers_on_duty(t_slot,teacher1,teacher2) values`
                for(i=1;i<(no_slots+1);i++){
                    idx1=Math.floor(Math.random()*result.length)
                    idx2=Math.floor(Math.random()*result.length)
                    if(result[idx2].title!=result[idx1].title){
                        sql2+=`('${i}','${result[idx2].title}','${result[idx1].title}'),`
                        result.splice(idx2,1)
                        result.splice(idx1,1)
                    }else{
                        i--;
                    }
                }
                sql2=sql2.slice(0,-1)
                sql2+=` on duplicate key update teacher1=values(teacher1),teacher2=values(teacher2)`
                console.log(sql2)
                con.query(sql2,(err,result2)=>{
                    if (err) throw err
                    index_screen.webContents.send('close:loading')
                    index_screen.webContents.send('open:timetables','3')

                })

            })
        }})
    
}

exports.generate_teaching=(index_screen,tt_process)=>{

    const options = {
        type: 'question',
        title: 'Generate timetable?',
        message: " Ensure all subjects are correct. This might take some time",
        buttons: ['Check subjects', 'continue','cancel'],
       
      }
    
     dialog.showMessageBox(null,options).then(response=>{
       if(response.response==0){
         index_screen.webContents.send('open-grouping')
       }else if(response.response==1){
        index_screen.webContents.send('show:loading','Generating')
            sql=`select name from streams`
            sql3=`select * from teacher_subjects where is_group=3`
            con.query(sql3,(err,result3)=>{
                if(err) throw err;
            con.query(sql,(err,result)=>{
                if(err) throw err;
                sql2=`select subject,form,class,has_double,title,subjects from teacher_subjects where title!='1' and is_group!=3`
                
                con.query(sql2,(err,result2)=>{
                    if(err) throw err;
                    tt_process.send('generate_ttt',result2,result,result3)
                   //generate_ttt(result2,result,result3,index_screen)
                })
            })
            })
       }
     })
   
}


function generate_ttt(all_subjects,all_streams,shared_group,index_screen){
    
    let no_streams=all_streams.length
    let no_classes=no_streams*4
    let no_slots=9
    let double_slots=[1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43]
    let days=['mon','tue','wed','thu','fri']
    let no_days=days.length
    
let all_data={
    filtered_sbjs:all_subjects,
    no_streams:no_streams,
    no_classes:no_classes,
    no_slots:no_slots,
    double_slots:double_slots,
    days:days,
    no_days:no_days,
    shared_group:shared_group,
    all_streams:all_streams,
    seeding:seeding,
    mutate:mutate,
    fitness:fitness,
    crossover:crossover

}
 

    let genetic=Genetic.create();

    genetic.seed=()=>{
        return userData.seeding.random_tt(
            userData.filtered_sbjs,userData.no_streams,userData.no_classes,userData.no_slots,
            userData.double_slots,userData.days,userData.no_days,userData.shared_group,userData.all_streams)
    }

    genetic.mutate=(tt)=>{
        return userData.mutate.mutate_tt(tt,userData.all_streams,userData.double_slots,userData.no_slots,userData.days)
    }
    genetic.crossover=(m,f)=>{
        return userData.crossover.cross(m,f,userData)
    }

    genetic.select1=Genetic.Select1.Fittest
    genetic.select2=Genetic.Select2.FittestRandom
    genetic.optimize=Genetic.Optimize.Minimize
    genetic.generation=(pop, generation, stats)=>{
        console.log(pop[0].fitness)

     return pop[0].fitness!=0
    }
    genetic.fitness=(tt)=>{
        return userData.fitness.calc_fitness(tt,userData.double_slots,userData.no_slots,userData.days)
    }

    var config={
        "iterations":1000,
        "size":250,
        "mutation":0.4,
        "skip":20,
        "crossover":0.2
    }
    genetic.notification = function(pop, generation, stats, isFinished) {
        if(isFinished){
            console.log(isFinished)
            console.log('finished')
            index_screen.send('close:loading')

            save_tt(pop[0].entity)
        }
        index_screen.send('set:loading_text','generation:'+generation)
    }
    

genetic.evolve(config,all_data)
//data=seeding.random_tt(filtered_sbjs,no_streams,no_classes,no_slots,double_slots,days,no_days,shared_group,all_streams)

//     y=JSON.stringify(y)
//     y=y.replace(/},/g,'},\n')

// fs.writeFileSync(__dirname+'/tt.json',y)
//data=require('./tt.json')
   
//  console.log(fitness.calc_fitness(data,double_slots,no_slots,days))
// console.table(data)
// data=mutate.mutate_tt(data,all_streams,double_slots,no_slots,days)
// console.table(data)
 //save_tt(data)
}


exports.save_teaching=(index_screen,tt)=>{
    save_tt(tt)
    index_screen.webContents.send('open:timetables','1')
}




function save_tt(tt){
        y=JSON.stringify(tt)
    y=y.replace(/},/g,'},\n')

 fs.writeFileSync(__dirname+'/tt.json',y)
    
    sql=`insert into teaching_timetable(form,class,t_day,t_slot,subject,teacher_title,is_double)
        values`
        for(i=0;i<tt.length;i++){
            slt=tt[i]
            sql+=`('${slt.form}','${slt.strm}','${slt.day}','${slt.no}','${slt.subject}','${slt.teachers}',${slt.double}),`
        }

        sql=sql.slice(0,-1);
        // sql+=`on duplicate key update subject=values(subject),teacher_title=values(teacher_title),is_double=values(is_double)`

        con.query(sql,(err,res)=>{
            if(err) throw err;

        })
}