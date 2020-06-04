
students_tab=document.querySelector('.students .results-content');

students_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    sel.addEventListener('change',e=>{
        data={
            form:students_tab.querySelector('.top-form-selector').value,
            class:students_tab.querySelector('.top-class-selector').value
        }
        console.log(document.querySelector('.students-title'))
        if(data.form=='' || data.class==''){
            students_tab.querySelector('.students-title').textContent="Select a class here above";
            students_tab.querySelectorAll('button').forEach(btn => {
                btn.setAttribute('disabled','true');
                btn.classList.add('disabled');
            })
        }else{
            console.log(data)
            students_tab.querySelectorAll('button').forEach(btn => {
                btn.removeAttribute('disabled');
                btn.classList.remove('disabled'); 
            })
            
            ipcRenderer.send('get:students',data)
            ///send request here
        }
    })
});



// add student

students_tab.querySelector('.save-student').addEventListener('click',e=>{
    data=[];
    students_tab.querySelectorAll('.add-entry-tab input[type="text"]').forEach(inp=>{
        data.push(inp.value)
    })
    data.push(students_tab.querySelector('.top-form-selector').value);
    data.push(students_tab.querySelector('.top-class-selector').value)
    students_tab.querySelectorAll('.add-entry-tab input[type="radio"]').forEach(rad=>{
        if(rad.checked){
            data.push(rad.value)
        }
    })
    with_err=false
    for(i=0;i<data.length;i++){
        if(data[i]==''){
            with_err=true;
        }
    }
    if(data.length<10){
        with_err=true
    }
    if(with_err){
        students_tab.querySelector('.add-entry-tab .error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('save:student',data)
        students_tab.querySelectorAll('.add-entry-tab .clearable').forEach(inp=>{
            inp.value=''
        })
    }
});


//update student

students_tab.querySelector('.update-student').addEventListener('click',e=>{
    data=[];
    data.push(window.selected_student_adm)
    students_tab.querySelectorAll('.update-entry-tab .student-input').forEach(inp=>{
        data.push(inp.value)
    })
    
    students_tab.querySelectorAll('.update-entry-tab input[type="radio"]').forEach(rad=>{
        if(rad.checked){
            data.push(rad.value)
        }
    });
    data.push(students_tab.querySelector('.top-form-selector').value)
    with_err=false
    for(i=0;i<data.length;i++){
        if(data[i]==''){
            with_err=true;
        }
    }
    if(data.length<9){
        with_err=true
    }
    if(with_err){
        students_tab.querySelector('.update-entry-tab .error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('update:student',data)
        // submit here
        students_tab.querySelector('.cancel-entry').click()
    }
});


function get_selected_students_row(){
    rows=students_tab.querySelectorAll('.entry-row').forEach(row=>{
        row.addEventListener('click',e=>{
            window.selected_student_adm=row.querySelector('td').textContent;
            console.log(window.selected_student_adm);
        })
    })
    }

    //delete student
    students_tab.querySelector('.delete-entry').addEventListener('click',e=>{
        if(window.selected_student_adm!=null ||window.selected_student_adm!=undefined ){
         console.log(window.selected_student_adm);
            data={
                adm:window.selected_student_adm,
                form:students_tab.querySelector('.top-form-selector').value,
                class:students_tab.querySelector('.top-class-selector').value

            }
         ipcRenderer.send('delete:student',data)
         //delete here
        }else{
            show_alert('f-danger','Select a student please')
        }
    })

    //print class list
    students_tab.querySelector('.print_class_list').addEventListener('click',e=>{
     dt={ form :students_tab.querySelector('.top-form-selector').value,
      class:students_tab.querySelector('.top-class-selector').value}
      window.current_students[0]? window.current_students[0].title=dt:window.current_students[0]={title:dt}
      show_loading('Printing')
        ipcRenderer.send('print:class_list',window.current_students)
        

    })


    // searching
    document.querySelector('#search-student').addEventListener('keyup',e=>{
        search_text= document.querySelector('#search-student').value;
        console.log(search_text);
        ipcRenderer.send('search:student',search_text)
    })


    //display table

    ipcRenderer.on('display:students',(e,students)=>{
        window.current_students=students
        students_tab.querySelector('.count_value').textContent=students.length
        window.selected_student_adm=null;
        student_table=students_tab.querySelector('.students-table');
        student_table.textContent='';
        students.forEach(student=>{
            tr=document.createElement('tr');
            tr.classList.add('entry-row');
            for(let[key,value] of Object.entries(student)){
                td=document.createElement('td');
                td.textContent=value;
                tr.appendChild(td)
            }
            student_table.appendChild(tr)
        })

        add_entry_row();
        get_selected_students_row()
    });

//prefill update_dtudent
ipcRenderer.on('fill:update_student',(e,data)=>{
    inputs=students_tab.querySelectorAll('.student-input')

    i=0;
    for(let[key,value] of Object.entries(data[0])){
        if(i==6){
            break;
        }
        inputs[i].value=value;
        i++;
    }

    if(data[0].gender=='male'){
        students_tab.querySelector('.update-entry-tab .male').checked=true;
    }else{
        students_tab.querySelector('.update-entry-tab .female').checked=true;
    }
students_tab.querySelector('.edit-title').textContent='Edit '+window.selected_student_adm;
});

students_tab.querySelector('.change-entry').addEventListener('click',e=>{
if(window.selected_student_adm){
    console.log(window.selected_student_adm)
    ipcRenderer.send('get:update_details',window.selected_student_adm)
}else{
    students_tab.querySelector('.cancel-entry').click();
    console.log(students_tab.querySelector('.cancel-entry'))
    show_alert('f-danger','Select a student to update')
}

})


//resister subjects.....................................................


function show_count_pie(data_in,texts){
    all_count=document.querySelector('#counts')
    var the_pie=new Chart(all_count,{
        type:'pie',
        data:{
            datasets:[{
                data:data_in,
                backgroundColor:["green","blue","red","yellow"]
            }],
            labels:texts,
        
        },
    
        
    })
}

selections_tab=document.querySelector('.selections-tab')

//getting statistics

selections_tab.querySelector('.change-entry').addEventListener('click',e=>{
    form=selections_tab.querySelector('.update-entry-tab .x-selector').value
    ipcRenderer.send('get:subject_selections_count',form);
});

//displaying statistics
ipcRenderer.on('show:selections_count',(e,data)=>{
    values=[]
    labels=[]
    for(let[key,value] of Object.entries(data[0])){
        labels.push(key);
        values.push(value)
    }
    show_count_pie(values,labels);
})

//displaying students table with selections

ipcRenderer.on('display:students_selections',(e,students,electives)=>{
    student_table=selections_tab.querySelector('tbody');
    student_table.textContent='';
    students.forEach(student=>{
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        for(let[key,value] of Object.entries(student)){
            td=document.createElement('td');
            td.textContent=value;
            tr.appendChild(td)
        }
        student_table.appendChild(tr)
    })
    electives_table=selections_tab.querySelector('.add-entry-tab .selections-table');
    electives_table.textContent='';
    electives.forEach(el=>{
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        td=document.createElement('td');
        td.textContent=el.name;
        tr.appendChild(td)
        td2=document.createElement('td');
        input=document.createElement('input');
        input.setAttribute('type','checkbox')
        td2.appendChild(input)
        tr.appendChild(td2);
        electives_table.appendChild(tr)
    })

    add_entry_row();
});

//class selections


selections_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    sel.addEventListener('change',e=>{
        data={
            form:selections_tab.querySelector('.top-form-selector').value,
            class:selections_tab.querySelector('.top-class-selector').value
        }
        if(data.form=='' || data.class==''){
            selections_tab.querySelector('.students-title').textContent="Select a class here above";
            selections_tab.querySelectorAll('.d').forEach(btn => {
                btn.setAttribute('disabled','true');
                btn.classList.add('disabled');
            })
        }else{
            console.log(data)
            selections_tab.querySelectorAll('.d').forEach(btn => {
                btn.removeAttribute('disabled');
                btn.classList.remove('disabled'); 
            })
            
            ipcRenderer.send('get:students_selection',data)
            ///send request here
        }
    })
});




//save selection



selections_tab.querySelector('.update-selection').addEventListener('click',e=>{
   inputs=selections_tab.querySelectorAll('.selections-table input');
   data={
    selected_subjs:'',
    adm:selections_tab.querySelector('.add-entry-tab input[type="text"]').value,
    form:selections_tab.querySelector('.top-form-selector').value,
    class:selections_tab.querySelector('.top-class-selector').value
   }
   console.log(inputs)
    inputs.forEach(inp=>{
        if(inp.checked){
            subj=inp.parentNode.parentNode.querySelector('td').textContent
            data.selected_subjs+=','+subj;
        }
    })
    if(data.adm=='' || data.selected_subjs==''){
        selections_tab.querySelector('.error').style.display='block'
    }else{
    ipcRenderer.send('update:selections',data)
    }
});

//reload form count

selections_tab.querySelector('.update-entry-tab .x-selector').addEventListener('change',e=>{
    form=selections_tab.querySelector('.update-entry-tab .x-selector').value
    ipcRenderer.send('get:subject_selections_count',form);
})


selections_tab.querySelector('#search-student').addEventListener('keyup',e=>{
    search_text= selections_tab.querySelector('#search-student').value;
    console.log(search_text);
    ipcRenderer.send('search:selections',search_text)
})


students_tab.querySelector('.pick-file').addEventListener('click',e=>{

    ipcRenderer.send('pick:students_file')

})

students_tab.querySelector('.open-sample').addEventListener('click',e=>{

ipcRenderer.send('open:students_sample')

})