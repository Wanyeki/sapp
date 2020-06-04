
tt_tab=document.querySelector('.timetables .timetable-content')

// initialization
tt_tab.querySelector('.view-tt').addEventListener('click',e=>{
  tt_tab.querySelector('.tt-class').value='south'
    data={
        timetable:'1',
        type:tt_tab.querySelector('.tt-type2').value,
        form:tt_tab.querySelector('.tt-form').value,
        class:tt_tab.querySelector('.tt-class').value,
        teacher:tt_tab.querySelector('.tt-teacher').value,
    }
    change_selectors(data)
    console.log(data)
    ipcRenderer.send('get:tt',data)
})

tt_tab.querySelectorAll('.tt-selectors .x-selector').forEach(sel=>{
    sel.addEventListener('change',e=>{
    data={
        timetable:tt_tab.querySelector('.tt-type').value,
        type:tt_tab.querySelector('.tt-type2').value,
        form:tt_tab.querySelector('.tt-form').value,
        class:tt_tab.querySelector('.tt-class').value,
        teacher:tt_tab.querySelector('.tt-teacher').value,
    }
    change_selectors(data)
    console.log(data)
    ipcRenderer.send('get:tt',data)
})
})
function change_selectors(data){
    if(data.timetable=='1' && data.type=='1'){
        tt_tab.querySelector('.tt-form').style.display='inline-block'
        tt_tab.querySelector('.tt-teacher').style.display='none'
        tt_tab.querySelector('.tt-class').style.display='inline-block'
    }else if(data.timetable=='1' && data.type=='2'){
        tt_tab.querySelector('.tt-form').style.display='none'
        tt_tab.querySelector('.tt-teacher').style.display='inline-block'
        tt_tab.querySelector('.tt-class').style.display='none'
    }else if(data.timetable=='2' && data.type=='1'){
        tt_tab.querySelector('.tt-form').style.display='inline-block'
        tt_tab.querySelector('.tt-teacher').style.display='none'
        tt_tab.querySelector('.tt-class').style.display='none'
    }else if(data.timetable=='2' && data.type=='2'){
        tt_tab.querySelector('.tt-form').style.display='none'
        tt_tab.querySelector('.tt-teacher').style.display='inline-block'
        tt_tab.querySelector('.tt-class').style.display='none'
    }else if(data.timetable=='3'){
        tt_tab.querySelector('.tt-form').style.display='none'
        tt_tab.querySelector('.tt-teacher').style.display='none'
        tt_tab.querySelector('.tt-class').style.display='none'
    }
}



//displaying tables

ipcRenderer.on('show:tt',(e,data,type,teachers)=>{
//teaching timetable
console.log(type)
    if(type=='1' && tt_tab.querySelector('.tt-type2').value=='1' ){
        
        tt=tt_tab.querySelector('.teaching-tt tbody')
        tt.textContent='';
        
        data.forEach(row=>{
            i=1;
            tr=document.createElement('tr');
            for(let[key,value] of Object.entries(row)){
                if(value){
                td=document.createElement('td')
                value=value.split(',');
                td.textContent=value.shift();
                
                   
                    if(value.pop()=='1'){
                        i++
                        td.setAttribute('colspan','2')
                    }
                div=document.createElement('div')
                value.forEach(vl=>{
                    div.innerHTML+=vl+'<br>'
                })
                div.style.fontSize='x-small'
                td.appendChild(div)
                tr.appendChild(td)
                
                i++;
                if(i==4 || i==8 || i==6){
                    td=document.createElement('td')
                    td.textContent='_'
                    tr.appendChild(td)
                }
                }else if(tt_tab.querySelector('.tt-type2').value=='2'){
                    td=document.createElement('td')
                    td.textContent=' '
                    tr.appendChild(td)
                }
            }
            tt.appendChild(tr)
        })

//exam timetable
    }else if (type=='2' && tt_tab.querySelector('.tt-type2').value=='1'){
        console.log(data)
        tt=tt_tab.querySelector('.exam-tt tbody')
        tt.textContent='';
        data.forEach(row=>{
            tr=document.createElement('tr');
            for(let[key,value] of Object.entries(row)){
                if(value){
                    td=document.createElement('td')
                    value=value.split(',')
                    value.length==1?value=value.concat(['','']):false
                    td.textContent=value.shift()
                    div=document.createElement('span')
                    div.style.fontSize='x-small'
                    div.style.color='#EB7880'
                    div.textContent='. '+value.shift()
                    td.appendChild(div)
                    if(value.pop()=='1'){
                        td.setAttribute('colspan','3')
                    }
                    div=document.createElement('div')
                    value.forEach(val => {
                        div.innerHTML+=val+'<br>'
                    });
                     div.style.fontSize='x-small'
                    td.appendChild(div)
                    tr.appendChild(td)
                }
            }
            tt.appendChild(tr)
        })

    }else{
        tt=tt_tab.querySelector('.onduty-tt tbody')
        tt.textContent='';
        tr=document.createElement('tr');
        data.forEach(col=>{
            td=document.createElement('td');
            td.textContent=col.teacher1;
            div=document.createElement('div')
            div.textContent=col.teacher2
            br=document.createElement('br')
            td.appendChild(br)
            td.appendChild(div)
            tr.appendChild(td)
        })
        tt.appendChild(tr)
    }
 if(tt_tab.querySelector('.tt-type2').value=='1'){
    teachers_box=tt_tab.querySelector('.tt-teacher');
    teachers_box.textContent='';
   
        console.log(type)
        teachers.forEach(teacher=>{
            opt=document.createElement('option');
            opt.setAttribute('value',teacher.title);
            opt.textContent=teacher.title;
            teachers_box.appendChild(opt)
        })
        //teacher tt
}else{
    
         console.log(data)
        tt=tt_tab.querySelector('.teaching-tt tbody')
        tt.textContent='';
        h=0;
        data.forEach(row=>{
            tr=document.createElement('tr')
            i=0
            prev='0'
            for(let[key,value] of Object.entries(row)){
                
                if(i==3 || i==6 || i==9){
                   if(type=='1'){
                   val=value?value.split(','):['','','0','']
                   td=document.createElement('td');
                    td.textContent='_'
                    tr.appendChild(td)
                   }
                    if(prev=='0'){
                    td2=document.createElement('td')
                    td2.textContent=val[0]
                    div=document.createElement('div')
                    div.style.fontSize='x-small'
                    div.textContent=val[1]+' '+val[3]
                    td2.appendChild(div)
                    if(val[2]=='1'){
                     td2.setAttribute('colspan','2')
                            
                    }
                    
                     tr.appendChild(td2)
                    }
                     prev=val[2]
                     i++
                }else{
                  
                    val=value?value.split(','):['','','0','']
                    if(!val[1]){val=val.concat(['','0',''])}
                     if(prev=='0'){
                            td=document.createElement('td')
                            td.textContent=val[0]
                        
                            div=document.createElement('div')
                            div.style.fontSize='x-small'
                            div.textContent=val[1]+' '+val[3]
                            td.appendChild(div)
                            if(val[2]=='1'){
                                td.setAttribute('colspan','2')
                               
                            }
                        
                        
                        
                            tr.appendChild(td)
                }
                    prev=val[2]
                }
               
            i++
          }
           tt.appendChild(tr)
        h++ 
    })
    
}
})


//generating tt

tt_tab.querySelector('.gen_teaching_tt').addEventListener('click',e=>{
    ipcRenderer.send('generate:teaching_tt')

})


//subject_groups..........................................................................


//get subjects

grouping_tab=document.querySelector('.view-groups-tab')

function get_tt_subjects(){
    console.log('getting')
    ipcRenderer.send('get_tt_subjects')
}

ipcRenderer.on('init_tt_subjects',(e,sbjs)=>{
   
    grouping_tab.querySelector('.f1-subjs').textContent=''
    grouping_tab.querySelector('.f2-subjs').textContent=''
    grouping_tab.querySelector('.f3-subjs').textContent=''
    grouping_tab.querySelector('.f4-subjs').textContent=''
    i=1
    sbjs.forEach(sb=>{
        switch(sb.form){
            case 'form-1':
                li=document.createElement('li')
                li.textContent=sb.subject
                if(sb.class=='group'){
                    li.classList+=' shared-ind2'
                }
                if(sb.has_double==1){
                    li.classList+=' group-ind2'
                }
                grouping_tab.querySelector('.f1-subjs').appendChild(li)
                break
            case 'form-2':
                li=document.createElement('li')
                li.textContent=sb.subject
                if(sb.class=='group'){
                    li.classList+=' shared-ind2'
                }
                if(sb.has_double==1){
                    li.classList+=' group-ind2'
                }
                grouping_tab.querySelector('.f2-subjs').appendChild(li)
                break
            case 'form-3':
                li=document.createElement('li')
                li.textContent=sb.subject
                if(sb.class=='group'){
                    li.classList+=' shared-ind2'
                }
                if(sb.has_double==1){
                    li.classList+=' group-ind2'
                }
                grouping_tab.querySelector('.f3-subjs').appendChild(li)
                    break
             case 'form-4':
                li=document.createElement('li')
                li.textContent=sb.subject
                if(sb.class=='group'){
                    li.classList+=' shared-ind2'
                }
                if(sb.has_double==1){
                    li.classList+=' group-ind2'
                }
                grouping_tab.querySelector('.f4-subjs').appendChild(li)
                        break

    }
    if(i==sbjs.length){
        add_selection()
    }
    i++
})

   
})

function is_dif_subject(sel){
    diff=false
    for(i=0;i<window.selected_grouping.length;i++){
        pres=window.selected_grouping[i].split(' ')[1]
        sele=sel.split(' ')[1]

        diff=sele!=pres;
console.log(sele)
    }
    
    return diff
}


function add_selection(){
window.selected_grouping=[]
lis=document.querySelectorAll('.view-groups-tab tbody li')
lis.forEach(element => {
    element.addEventListener('click',e=>{
        subject=element.textContent;
        form=element.parentNode.getAttribute('class');
        form=form.split('-')
        form=form[0].replace('f','form-')
        subject=subject+=' '+form
        if(window.selected_grouping.indexOf(subject)>-1){
            element.style.background=null
            element.style.color=null
            window.selected_grouping=window.selected_grouping.filter(sel=>{
                return sel!=subject;
            })
        }else{
            if(window.selected_grouping.length>0 && is_dif_subject(subject)){
                show_alert('f-danger','Should be same Form')
            }else{
            element.style.background="#534877"
            element.style.color='#fff'
            window.selected_grouping.push(subject)
            }

        }
       if(window.selected_grouping.length>0){
  
        if(window.selected_grouping.length==1){
            grouping_tab.querySelector('.ungroup-class').removeAttribute('disabled');
        grouping_tab.querySelector('.ungroup-class').classList.remove('disabled');
        }else{ 
         grouping_tab.querySelector('.change-entry').removeAttribute('disabled');
        grouping_tab.querySelector('.change-entry').classList.remove('disabled');
            grouping_tab.querySelector('.ungroup-class').setAttribute('disabled','true');
            grouping_tab.querySelector('.ungroup-class').classList.add('disabled');
        }
       }else{
        grouping_tab.querySelector('.change-entry').setAttribute('disabled','true');
        grouping_tab.querySelector('.change-entry').classList.add('disabled');
        grouping_tab.querySelector('.ungroup-class').setAttribute('disabled','true');
            grouping_tab.querySelector('.ungroup-class').classList.add('disabled');
       }
    })
})}

grouping_tab.querySelector('.save-grouping').addEventListener('click',e=>{
    data={
        subjects:window.selected_grouping,
        group_name:grouping_tab.querySelector('.group_name').value.replace(/\s+/g,'_')
    }
  grouping_tab.querySelector('.group_name').value=''
    ipcRenderer.send('save_grouping',data)
    console.log(data)
}) 


grouping_tab.querySelector('.ungroup-class').addEventListener('click',e=>{
    ipcRenderer.send('ungroup_grouping',window.selected_grouping)
});

document.querySelector('.print-tt').addEventListener('click',e=>{

    type=tt_tab.querySelector('.tt-type2').value,
    form=tt_tab.querySelector('.tt-form').value,
    stream=tt_tab.querySelector('.tt-class').value,
    teacher=tt_tab.querySelector('.tt-teacher').value,

    timetable=tt_tab.querySelector('.tt-type').value
    console.log(timetable)
    data=null
    if(timetable=='1'){
        data=tt_tab.querySelector('.teaching-tt table').innerHTML
        if(type=='1'){
        title=form+' '+stream+' Class timetable'
        }else{
            title=teacher+' Teaching timetable'
        }
    }else
    if(timetable=='2'){
        data=tt_tab.querySelector('.exam-tt table').innerHTML
        if(type=='1'){
        title=form+' Exam timetable'
        }else{
            title=teacher+' Exam timetable'
        }
    }else
    if(timetable=='3'){
        data=tt_tab.querySelector('.onduty-tt table').innerHTML
        title='Teachers on duty'
    }
  show_loading('Printing')
 ipcRenderer.send('print:tt',{text:data,title:title})
})

document.querySelector('.gen_onduty_tt').addEventListener('click',e=>{
 ipcRenderer.send('generate:onduty')
})

ipcRenderer.on('open:timetables',(e,tt)=>{
    document.querySelector('#timetables').click()
    tt_tab.querySelector('.cancel-entry').click()
    tt_tab.querySelector('.view-tt').click()
    tt_tab.querySelector('.tt-type').value=tt
    tt_tab.querySelector('.tt-type').dispatchEvent(new Event('change'))
})
document.querySelector('.tod').addEventListener('click',e=>{
    document.querySelector('#timetables').click()
    tt_tab.querySelector('.cancel-entry').click()
    tt_tab.querySelector('.view-tt').click()
    tt_tab.querySelector('.tt-type').value='3'
    tt_tab.querySelector('.tt-type').dispatchEvent(new Event('change'))
})


tt_tab.querySelector('.gen_exam_tt').addEventListener('click',e=>{
    entry_mode=tt_tab.querySelector('.entry-mode')
    show_tab(['block','none','none'],entry_mode)
})

tt_tab.querySelector('.open-register').addEventListener('click',e=>{
    document.querySelector('#results').click()
    document.querySelector('.register-exams').click()
})


tt_tab.querySelector('.generate-exam').addEventListener('click',e=>{
    exam=tt_tab.querySelector('.registered-exams-selector').value
    if(exam==''){
        tt_tab.querySelector('.error').style.display='block'
    }else{
        console.log(exam)
        ipcRenderer.send('gen_exam_tt',exam)
    }
})