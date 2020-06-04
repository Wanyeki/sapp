
function get_teachers(subject){
    console.log(subject)
    ipcRenderer.send('get:teachers',subject)
}

teachers_tab=document.querySelector('.teachers .results-content');

teachers_tab.querySelector('.top-subject-selector').addEventListener('change',e=>{
    get_teachers(teachers_tab.querySelector('.top-subject-selector').value)
})


//add teacher
teachers_tab.querySelector('.save-teacher').addEventListener('click',e=>{
    data=[];
    teachers_tab.querySelectorAll('.add-entry-tab .teacher-input').forEach(inp=>{
        data.push(inp.value)
    })
    data.push(teachers_tab.querySelector('.top-subject-selector').value)
    with_err=false
    for(i=0;i<data.length;i++){
        if(data[i]==''){
            with_err=true;
        }
    }
    if(with_err){
        teachers_tab.querySelector('.add-entry-tab .error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('save:teacher',data)
        teachers_tab.querySelectorAll('.add-entry-tab .teacher-input').forEach(inp=>{
            inp.value=''
        })
    }
});


//updating teacher

teachers_tab.querySelector('.update-teacher').addEventListener('click',e=>{
    data=[];
    teachers_tab.querySelectorAll('.update-entry-tab .teacher-input').forEach(inp=>{
        data.push(inp.value)
    })
    data.push(teachers_tab.querySelector('.top-subject-selector').value)
    data.push(window.selected_teacher_id)
    with_err=false
    for(i=0;i<data.length;i++){
        if(data[i]==''){
            with_err=true;
        }
    }
    if(with_err){
        teachers_tab.querySelector('.update-entry-tab .error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('update:teacher',data)
        teachers_tab.querySelector('.update-entry-tab .cancel-entry').click()
    }
});


function get_selected_teacher_row(){
    rows=teachers_tab.querySelectorAll('.entry-row').forEach(row=>{
        row.addEventListener('click',e=>{
            window.selected_teacher_id=row.querySelector('td').textContent;
            console.log(window.selected_teacher_id);
        })
    })
    }

//delete teacher
teachers_tab.querySelector('.delete-entry').addEventListener('click',e=>{
    if(window.selected_teacher_id!=null ||window.selected_teacher_id!=undefined ){
        console.log(window.selected_teacher_id);
        data={
            id:window.selected_teacher_id,
            subject:teachers_tab.querySelector('.top-subject-selector').value

        }
        console.log(data)
        ipcRenderer.send('delete:teacher',data)
        //delete here
    }else{
        show_alert('f-danger','Select a teacher please')
    }
})

 //display table

 ipcRenderer.on('display:teachers',(e,teachers)=>{
    teachers_tab.querySelector('.count_value').textContent=teachers.length

    window.selected_teacher_id=null;
    teacher_table=teachers_tab.querySelector('tbody');
    teacher_table.textContent='';
    teachers.forEach(teacher=>{
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        for(let[key,value] of Object.entries(teacher)){
            td=document.createElement('td');
            td.textContent=value;
            tr.appendChild(td)
        }
        teacher_table.appendChild(tr)
    })

    add_entry_row();
    get_selected_teacher_row()
});

//prefill update_teacher
ipcRenderer.on('fill:update_teacher',(e,data)=>{
inputs=teachers_tab.querySelectorAll('.update-entry-tab .teacher-input')

i=0
for(let[key,value] of Object.entries(data[0])){
    inputs[i].value=value;
    i++
}

teachers_tab.querySelector('.edit-title').textContent='Edit '+data[0].title;
});

teachers_tab.querySelector('.change-entry').addEventListener('click',e=>{
if(window.selected_teacher_id){
console.log(window.selected_teacher_id)
ipcRenderer.send('get:update_teacher_details',window.selected_teacher_id)
}else{
teachers_tab.querySelector('.cancel-entry').click();
show_alert('f-danger','Select a teacher to update')
}

})


//subjects..........................................................................................................................




subjects_teacher_tab=document.querySelector('.subjects .subjects-tab');

function get_teacher_subject(form){
    select_mode=false
    ipcRenderer.send('get:subject_teacher',form,select_mode);

}


subjects_teacher_tab.querySelector('.subject-form-selector').addEventListener('change',e=>{
    get_teacher_subject(subjects_teacher_tab.querySelector('.subject-form-selector').value)
})

// save mapping
subjects_teacher_tab.querySelector('.update-entry-tab .save-entry').addEventListener('click',e=>{
   teacher_id=subjects_teacher_tab.querySelector('.teacher-subject-selector').value
   teacher_id=teacher_id.split('$');
   
    data={ 
        teacher_title:teacher_id[1],
        t_id:teacher_id[0],
        subject:get_subject()[1],
        class:get_subject()[3],
        form:subjects_teacher_tab.querySelector('.subject-form-selector').value,
   }

console.log(data)
if(data.t_id!=''){
  ipcRenderer.send('save:mapping',data)
  subjects_teacher_tab.querySelector('.cancel-entry').click() 
}else{
    subjects_teacher_tab.querySelector('.update-entry-tab .error').style.display='block'
}

//    submit here
})

function get_subject(){
    if(window.selected_subject){
        return window.selected_subject.split(' ');
    }else{ 
        show_alert('f-danger','Select a row')
        return []
    }
 
}

// change teacher 
subjects_teacher_tab.querySelector('.change-entry').addEventListener('click',e=>{
    if(window.selected_subject){
        console.log(window.selected_subject)
        type=subjects_teacher_tab.querySelector('.teacher-type-selector');
        type.textContent=''

        opt1=document.createElement('option')
        opt1.setAttribute('value',get_subject()[1]);
        opt1.textContent=get_subject()[1];
        type.appendChild(opt1);

        opt2=document.createElement('option')
        opt2.setAttribute('value','all');
        opt2.textContent='All teachers';
        type.appendChild(opt2)


        ipcRenderer.send('get:some_teachers',get_subject()[1])
        }else{
        subjects_teacher_tab.querySelector('.cancel-entry').click();
        show_alert('f-danger','Select a row to update')
        }
});

function get_selected_subject_row(){
    rows=subjects_teacher_tab.querySelectorAll('.entry-row').forEach(row=>{
        row.addEventListener('click',e=>{
            subjects_teacher_tab.querySelector('.cancel-entry').click() 
            window.selected_subject=row.querySelector('td:nth-child(2)').textContent;
            btn=subjects_teacher_tab.querySelector('.ungroup-class')
            if(window.selected_subject.indexOf('group')>0){
                btn.removeAttribute('disabled');
                btn.classList.remove('disabled'); 
            }else{
                btn.setAttribute('disabled','true');
                btn.classList.add('disabled');   
            }
            console.log(window.selected_subject);
        })
    })
    }

    //ungroup class
    subjects_teacher_tab.querySelector('.ungroup-class').addEventListener('click',e=>{
        data=get_subject()
        data.shift()
        console.log(data)
        ipcRenderer.send('ungroup:class',data)
    })

    // remove teacher
    subjects_teacher_tab.querySelector('.remove-teacher').addEventListener('click',e=>{
        data=get_subject()
        data.shift()
        console.log(data)
ipcRenderer.send('remove:teacher_mapping',data)
        // remove here
    });


    // display table
    ipcRenderer.on('display:class_subjects',(e,data,select_mode)=>{
    window.selected_subject=null;
    subject_teacher_table=subjects_teacher_tab.querySelector('tbody');
    subject_teacher_table.textContent='';
    data.forEach(row=>{
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        i=0
        sbj=''
        for(let[key,value] of Object.entries(row)){
            sbj+=' '+value;
            if(i>1){
            td=document.createElement('td');
            i==2?td.textContent=sbj:td.textContent=value
            if(i==3){
                if(value=='0'){
                    td.textContent='No teacher'
                    tr.classList.add('highlighted')
                }
            }
            tr.appendChild(td)
            }else if(i==0){
            td=document.createElement('td');
            img=document.createElement('img')
            img.classList.add('subject-icon')
            img.setAttribute('src','../assets/images/icon.png')
            td.appendChild(img)
            tr.appendChild(td)
            }
            i++
        }
        if(row.title!='1'){
            subject_teacher_table.appendChild(tr)
        }
        
    })
    console.log(select_mode)
if(select_mode){
    subjects_teacher_tab.querySelector('.merge-title').textContent='Now select classes to merge'
    add_select_effect()
}else{
    subjects_teacher_tab.querySelector('.merge-check').checked=false;
    subjects_teacher_tab.querySelector('.selected-no').textContent=''

    add_entry_row();
    get_selected_subject_row() 
}
    })


    //set selectors
ipcRenderer.on('set:subject_teachers',(e,teachers)=>{
    teacher_selector=subjects_teacher_tab.querySelector('.teacher-subject-selector');
    teacher_selector.textContent='';
    opt2=document.createElement('option')
    opt2.setAttribute('value','');
    opt2.textContent='Select teacher';
    teacher_selector.appendChild(opt2)
    teachers.forEach(tcr=>{
        opt=document.createElement('option');
        opt.setAttribute('value',tcr.national_id+'$'+tcr.title);
        opt.textContent=tcr.title;
        teacher_selector.appendChild(opt)

    });
});

subjects_teacher_tab.querySelector('.teacher-type-selector').addEventListener('change',e=>{
    console.log('why is this happening')

    ipcRenderer.send('get:some_teachers',subjects_teacher_tab.querySelector('.teacher-type-selector').value)
});


//toogle select mode

subjects_teacher_tab.querySelector('.merge-check').addEventListener('click',e=>{
    window.selected_rows=[]
    if(subjects_teacher_tab.querySelector('.merge-check').checked){
         select_mode=true
         ipcRenderer.send('get:subject_teacher',subjects_teacher_tab.querySelector('.subject-form-selector').value,select_mode);
    }else{
        subjects_teacher_tab.querySelector('.merge-title').textContent='Check to merge classes to one'
        select_mode=false
        ipcRenderer.send('get:subject_teacher',subjects_teacher_tab.querySelector('.subject-form-selector').value,select_mode);
    }
})
function is_diff_subject(sel){
    diff=false
    for(i=0;i<window.selected_rows.length;i++){
        pres=window.selected_rows[i].split(' ')[1]
        sele=sel.split(' ')[1]

        diff=sele!=pres;
console.log(sele)
    }
    
    return diff
}

function add_select_effect(){
    rows=subjects_teacher_tab.querySelectorAll('.entry-row').forEach(row=>{
        row.addEventListener('click',e=>{
            selected_r=row.querySelectorAll('td')[1].textContent
            if(window.selected_rows.indexOf(selected_r)<0){
                if(window.selected_rows.length>0 && is_diff_subject(selected_r)){
                    show_alert('f-danger','Should be same subject')
                }else{
                window.selected_rows.push(selected_r);
                subjects_teacher_tab.querySelector('.selected-no').textContent= window.selected_rows.length+' selected';
                row.style.background="#534877"
                row.style.color='#fff'
                x=false}
             }else{
                    window.selected_rows=window.selected_rows.filter(item=> item!=selected_r );
                    subjects_teacher_tab.querySelector('.selected-no').textContent= window.selected_rows.length+' selected';
                    row.style.background=null;   
                    row.style.color=null;
                    x=true;
             }
                console.log(window.selected_rows)
        })
       
    })
}


//merge group
subjects_teacher_tab.querySelector('.save-merge').addEventListener('click',e=>{
    data={
        name:subjects_teacher_tab.querySelector('.group_name').value.replace(/\s+/g,'_'),
        subjects:window.selected_rows,
        form:subjects_teacher_tab.querySelector('.subject-form-selector').value
    }

    if(window.selected_rows.length<2 || data.name==''){
        subjects_teacher_tab.querySelector('.error').style.display='block'
    }else{
    ipcRenderer.send('save:merge',data)
    }
    console.log(data)

})



document.querySelector('.remove-subject').addEventListener('click',e=>{
    console.log(get_subject())
    ipcRenderer.send('remove_subject',get_subject())
});

document.querySelector('.reset_all').addEventListener('click',e=>{
    ipcRenderer.send('reset_all',{form:subjects_teacher_tab.querySelector('.subject-form-selector').value})
});