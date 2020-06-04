const {remote} =require('electron')

const school_info=remote.require('./assets/js/school_info')

school_props=document.querySelectorAll('.school_info');
school_props.forEach(elm=>{
    props=school_info.get_all()
    id=elm.getAttribute('id')
    prop=props[id]
    elm.textContent=prop
})

ipcRenderer.on('go:settings_home',e=>{
    go_settings_home()
})

ipcRenderer.on('set:configurations',(e,data)=>{
    i=0;
    data.forEach(config => {
        if(i<6){
        elm=document.querySelector('.'+config.title);
        elm.value=config.value;
        i++}
    });
});


document.querySelector('#stream-tab').addEventListener('click',e=>{
    ipcRenderer.send('get:streams');
})



document.querySelector('#add-subject-tab').addEventListener('click',e=>{
    ipcRenderer.send('get:subjects');
})

ipcRenderer.on('set:subjects',(e,subjects)=>{
    document.querySelector('.add-subject-tab tbody').textContent='';
    subjects.forEach(subject=>{
        tr=document.createElement('tr');
        td1=document.createElement('td');
        td2=document.createElement('td');
        td3=document.createElement('td');

        check=document.createElement('input');
        check.setAttribute('type','checkbox');

        check1=document.createElement('input');
        check1.setAttribute('type','checkbox');

        check1.checked=subject.elective==1;
        check.checked=subject.has_double==1;
        

        td2.appendChild(check);
        td3.appendChild(check1);
        td1.textContent=subject.name;
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        document.querySelector('.add-subject-tab tbody').appendChild(tr)
    })
    
});

// document.querySelector('#grouping-tab').addEventListener('click',e=>{
//     ipcRenderer.send('get:groups');
// })

ipcRenderer.on('set:groups',(e,groups,subjects)=>{
    document.querySelector('.groups').innerHTML='';
    groups.forEach(group=>{
        group_text1='<div class="group"> <div class="group-name">'+group.name+'</div><ul class="group-items">';
        subjects.forEach(subject=>{
            if(subject.group_id==group.id){
                group_text1+='<li>'+subject.name+'</li>'
            }
        });
        group_text1+= '</ul></div>';
        document.querySelector('.groups').innerHTML+=group_text1;
    })
})

document.querySelector('#grading-tab').addEventListener('click',e=>{
    ipcRenderer.send('get:grading');
})
ipcRenderer.on('set:grading',(e,gradings)=>{
    document.querySelector('.grading-tab tbody').textContent=''
    gradings.forEach(grading=>{
        tr=document.createElement('tr');
        td1=document.createElement('td');
        td2=document.createElement('td');
        check=document.createElement('input');
        check.setAttribute('type','text');
        check.style.textAlign='center';
        check.value=grading.value;
        

        td2.appendChild(check);
        td1.textContent=grading.subject;
        tr.appendChild(td1)
        tr.appendChild(td2)
        document.querySelector('.grading-tab tbody').appendChild(tr)

    })
});

//settings exams table
ipcRenderer.on('set:exams',(e,exams_done,exam)=>{
    document.querySelector('.exams-table tbody').textContent='';
     exams_done.forEach(exam=>{
         exam_ticks=exam.exams.replace('[','');
         exam_ticks=exam_ticks.replace(']','');
         exam_ticks=exam_ticks.split(',');
        tr=document.createElement('tr');
        tr.classList.add('entry-row-check')
        for(i=0;i<6;i++){
            td=document.createElement('td');
            if(i>1){
                check=document.createElement('input');
                check.setAttribute('type','checkbox');
                check.checked=exam_ticks[i-2]=='1';
                td.appendChild(check)
            }else{
                img=document.createElement('img')
                img.classList.add('subject-icon')
                img.setAttribute('src','../assets/images/icon.png')
                i==1?td.textContent=exam.subject:td.appendChild(img);
            }

        tr.appendChild(td);
        }
         
        document.querySelector('.exams-table tbody').appendChild(tr);
        tr.addEventListener('click',e=>{
           checks= e.toElement.parentNode.parentNode.querySelectorAll('input')
           
          if(checks[3].checked){
            checks[1].checked=true
            checks[2].checked=false
           
          }
          if(checks[2].checked){
            checks[1].checked=true
            checks[3].checked=false
           
          }
          if(checks[1].checked){
            checks[0].checked=true
            
           
          }

           
        })
     });
     document.querySelector('.selected_exam_type').value=exam;
     document.querySelector('.form-title').textContent=document.querySelector('.exam-form').value;
     

});


document.querySelector('.save-home-settings').addEventListener('click',e=>{

    values=[]
    document.querySelectorAll('.home-settings').forEach(elm => {
        values.push(elm.value)
    });
    
    ipcRenderer.send('save:home_settings',values);
});

document.querySelector('.save-stream').addEventListener('click',e=>{

  stream=document.querySelector('.stream-input').value.replace(/\s+/g,'_');
  ipcRenderer.send('save:stream',stream);
  querySelector('.stream-input').value=';'
});

document.querySelector('.add-subject').addEventListener('click',e=>{
    subject=document.querySelector('.subject-input').value.replace(/\s+/g,'_');
    ipcRenderer.send('save:subject',subject);
    document.querySelector('.subject-input').value='';
});

document.querySelector('.save-subjects').addEventListener('click',e=>{
    rows=document.querySelectorAll('.add-subject-tab tbody tr');
    values=[];
    subjects=[];
    electives=[]
    rows.forEach(row=>{
        values.push(row.querySelector('input').checked?1:0);
        electives.push(row.querySelectorAll('input')[1].checked?1:0);
        subjects.push(row.querySelector('td').textContent);
    });
    
    ipcRenderer.send('update:subjects',subjects,values,electives);
});


ipcRenderer.on('set:subject_selectors',(e,subjects)=>{

    subl_selectors=document.querySelectorAll('.subjects-selector');

    subl_selectors.forEach(subj_selector=>{
        subj_selector.textContent='';
        opt=document.createElement('option');
        opt.setAttribute('value','')
        opt.textContent='Select subject';
        subj_selector.appendChild(opt)

        subjects.forEach(subject=>{
        opt=document.createElement('option');
        opt.setAttribute('value',subject.name)
        opt.textContent=subject.name;
        subj_selector.appendChild(opt)
        })
        
    })
});

ipcRenderer.send('initialize:index');

document.querySelector('.save-group').addEventListener('click',e=>{
    group={
        name:document.querySelector('.group-input').value,
        subjects:[]
    }

    document.querySelectorAll('.add-group-tab .subjects-selector').forEach(sel=>{
        group.subjects.push(sel.value)
        sel.value='';
    })
    document.querySelector('.group-input').value='';
    ipcRenderer.send('save:group',group)
});

document.querySelector('.save-grading').addEventListener('click',e=>{
    rows=document.querySelectorAll('.grading-tab tbody tr');
    values=[];
    subjects=[];
    rows.forEach(row=>{
        values.push(row.querySelector('input').value);
        subjects.push(row.querySelector('td').textContent);
    });
    
    ipcRenderer.send('update:grading',subjects,values);
});

save_exams=document.querySelector('.save-exams');

save_exams.addEventListener('click',e=>{
    rows=document.querySelectorAll('.exams-table tbody tr')
    data={}
    rows.forEach(row=>{
        tds=row.querySelectorAll('td');
        subject=tds[1].textContent;
        inputs=row.querySelectorAll('input');
        values=[]
        inputs.forEach(input=>{
            value=input.checked?1:0;
            values.push(value);
        });
        data[subject]=values;
    });
    exam=document.querySelector('.selected_exam_type').value;
    form=document.querySelector('.exam-form').value
    term=document.querySelector('.exam-selector').value;
ipcRenderer.send('update:exams',data,term,form,exam)
});


ipcRenderer.on('set:registered_exams_selector',(e,exams)=>{
    exam_sels=document.querySelectorAll('.registered-exams-selector')
    exam_sels.forEach(exam_sel=>{
    exam_sel.textContent='';
    initial_opt=document.createElement('option')
    initial_opt.textContent='Select exam';
    initial_opt.setAttribute('value','')
    exam_sel.appendChild(initial_opt)
    exams.forEach(exam=>{
        period=exam.exam+' '+exam.term;
        opt=document.createElement('option');
        opt.setAttribute('value',period)
        opt.textContent=period;
        exam_sel.appendChild(opt)
    
    })
})
});

ipcRenderer.on('init:term',(e,this_term)=>{
    document.term=this_term[0].value;
    terminate=document.querySelector('.terminate');
    start=document.querySelector('.start');
    if(this_term[0].value!=0){
        document.querySelector('.term').textContent=this_term[0].value;
        term_status=document.querySelector('.status');
        term_status.classList.remove('danger');
        term_status.classList.add('success');
        term_status.textContent=this_term[0].value+' running!';

        terminate.classList.remove('disabled');
        terminate.removeAttribute('disabled');

        start.classList.add('disabled');
        start.setAttribute('disabled','true');
        
    }else{

        term_status=document.querySelector('.status');
        term_status.classList.remove('success');
        term_status.classList.add('danger');
        term_status.textContent='No term running!';
        document.querySelector('.term').textContent='No term registered'
        
        terminate.classList.add('disabled');
        terminate.setAttribute('disabled','true');

        start.classList.remove('disabled');
        start.removeAttribute('disabled');
    
        term_sel=document.querySelector('.term-selector');
        term_sel.textContent='';
        opts=[]
        if(this_term[1].value.indexOf(1)==5){
            opts[0]=document.createElement('option');
            opts[0].textContent='Term-2-'+year;
            opts[0].setAttribute('value','term-2-'+year);
            opts[1]=document.createElement('option');
            opts[1].textContent='Term-3-'+year;
            opts[1].setAttribute('value','term-3-'+year);

        }else if(this_term[1].value.indexOf(2)==5){
            console.log('Grrrrrrrrrrrrrrrrrrr')
            console.log(this_term[1].value)
            opts[0]=document.createElement('option');
            opts[0].textContent='Term-3-'+year
            opts[0].setAttribute('value','term-3-'+year);
        }else{
            opts[0]=document.createElement('option');
            opts[0].textContent='Term-1-'+year
            opts[0].setAttribute('value','term-1-'+year);
            opts[1]=document.createElement('option');
            opts[1].textContent='Term-2-'+year;
            opts[1].setAttribute('value','term-2-'+year);
            opts[2]=document.createElement('option');
            opts[2].textContent='Term-3-'+year
            opts[2].setAttribute('value','term-3-'+year);
        }

        opts.forEach(opt=>{
            term_sel.appendChild(opt)
        })

    }
    term_field=document.querySelectorAll('.term-field');

    term_field.forEach(field=>{
        field.textContent=this_term[0].value
    })
    register_exam_sel=document.querySelector('.exam-selector');
    register_exam_sel.textContent='';
    opts=[];
    opts[0]=document.createElement('option')
    opts[0].setAttribute('value','')
    opts[0].textContent='Select Exam';

    opts[1]=document.createElement('option')
    opts[1].setAttribute('value','Opener '+this_term[0].value)
    opts[1].textContent='Opener '+this_term[0].value;

    opts[2]=document.createElement('option')
    opts[2].setAttribute('value','Mid '+this_term[0].value)
    opts[2].textContent='Mid '+this_term[0].value;

    opts[3]=document.createElement('option')
    opts[3].setAttribute('value','End '+this_term[0].value)
    opts[3].textContent='End '+this_term[0].value;
    opts.forEach(opt=>{
        register_exam_sel.appendChild(opt)
    })
})

 document.querySelector('.register-next').addEventListener('click',e=>{
    selected_term=document.querySelector('.term-selector').value
    document.querySelector('.selected_term').textContent=selected_term;
    if(selected_term.indexOf('term-1')>-1){
        document.querySelector('.term-1-text').style.display='block';
        document.querySelector('.term-1-text input').setAttribute('checked','true')

    }else{
        document.querySelector('.term-1-text').style.display='none' ; 
        document.querySelector('.term-1-text input').removeAttribute('checked');
    }
 })
document.querySelector('.register-term').addEventListener('click',()=>{
    selected_term=document.querySelector('.term-selector').value;
    migrate_students=document.querySelector('.term-1-text input').checked
    ipcRenderer.send('register:term',selected_term,migrate_students);
    if(migrate_students){
        show_loading('Migrating students');
    }
    document.querySelector('.terminate-wizard .cancel').click()
    // ipcRenderer.send('initialize:index');

})

document.querySelector('.continue-terminate').addEventListener('click',()=>{
    ipcRenderer.send('terminate:term');
    document.querySelector('#finish .cancel').click()
    // ipcRenderer.send('initialize:index');

});

ipcRenderer.on('set:streams',(e,streams)=>{
    document.querySelector('.all-streams').textContent='';

    streams.forEach(stream=>{
        li=document.createElement('li');
        li.textContent=stream.name
        document.querySelector('.all-streams').appendChild(li)
    })

    document.querySelectorAll('#stream-selector').forEach(sel=>{
        sel.textContent='';
        opt2=document.createElement('option');
        opt2.textContent='Select class'
        opt2.setAttribute('value','')
        sel.appendChild(opt2)
        streams.forEach(st=>{
            opt=document.createElement('option'),
            opt.textContent=st.name;
            opt.setAttribute('value',st.name)
            sel.appendChild(opt)
        })
        
    })
})
ipcRenderer.on('init:counts',(e,result)=>{
    init_counts(result[0].students,result[0].teachers)
})