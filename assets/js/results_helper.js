
results_tab=document.querySelector('.insert-marks-tab');

// top selectors
results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    sel.addEventListener('change',e=>{
       request_change('paper1',true)
    })
});

function request_change(paper,reload_paper){
    select_data={
        form:results_tab.querySelector('.res-form-selector').value,
        stream:results_tab.querySelector('.res-stream-selector').value,
        subject:results_tab.querySelector('.res-subject-selector').value,
        term:document.querySelector('.registered-exams-selector').value,
        paper:paper
        }
        
        if(select_data.form=='' || select_data.stream=='' || select_data.subject==''){
            results_tab.querySelector('.table-title').textContent='Ensure the above are selected correctly before Filling !';
            results_tab.querySelector('.save-entry').setAttribute('disabled','true');
            results_tab.querySelector('.save-entry').classList.add('disabled');
            results_tab.querySelector('.pick-file').setAttribute('disabled','true');
            results_tab.querySelector('.pick-file').classList.add('disabled');
            results_tab.querySelectorAll('.action-buttons .tab-btn').forEach(btn => {
                btn.setAttribute('disabled','true');
                btn.classList.add('disabled');
            })
        }else{
        
        ipcRenderer.send('get:res-table',select_data,reload_paper)
        results_tab.querySelector('.table-title').textContent=select_data.subject+' '+select_data.paper+' '+select_data.form+' '+select_data.stream+' ';
        exam_elm=document.createElement('span')
        exam_elm.style.color='rgb(40, 173, 226)'
        exam_elm.textContent=document.querySelector('.registered-exams-selector').value
        results_tab.querySelector('.table-title').appendChild(exam_elm);
            //initialize selectors here
            // console.log(select_data)
            results_tab.querySelector('.save-entry').removeAttribute('disabled');
            results_tab.querySelector('.save-entry').classList.remove('disabled');

            results_tab.querySelector('.pick-file').removeAttribute('disabled');
            results_tab.querySelector('.pick-file').classList.remove('disabled');
            results_tab.querySelectorAll('.action-buttons .tab-btn').forEach(btn => {
                btn.removeAttribute('disabled');
                 btn.classList.remove('disabled');
            })
        }
}



// result insert fields

results_tab.querySelector('.paper-selector').addEventListener('change',e=>{
    request_change(results_tab.querySelector('.paper-selector').value,false)
})
results_tab.querySelector('.save-entry').addEventListener('click',e=>{
    inputs=results_tab.querySelectorAll('.add-entry-tab .add-input');
    data=[]
    with_error=false;
    for(i=0;i<inputs.length;i++){
        data.push(inputs[i].value)
        if(inputs[i].value==''){
           with_error=true; 
        }
    }
    console.log(data)

    if(with_error){
        results_tab.querySelector('.add-entry-tab .error').style.display='block';
    }else{
        percentage_data=[];
        results_tab.querySelector('.add-entry-tab .error').style.display='none';
        if(results_tab.querySelector('.paper-selector').value=='practical'){
            percentage_data[0]=data[0];
            percentage_data[1]=data[1];
            percentage_data[2]=data[2]
        }else{
            percentage_data[0]=data[0];
            percentage_data[1]=data[1];
            if(window.has_prac){
            percentage_data[2]=Math.round( to_int(data[2])*60/to_int(data[3]));
            }else{
            percentage_data[2]=Math.round( to_int(data[2])*100/to_int(data[3]));
            }
        }
        results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
            percentage_data.push(sel.value)
        });
        percentage_data.push(document.querySelector('.registered-exams-selector').value)
        console.log(percentage_data)
        // submit_here
        console.log(percentage_data)
        ipcRenderer.send('save:entry',percentage_data)

    }
    results_tab.querySelectorAll('.add-entry-tab .clearable').forEach(el=>{
        el.value='';
    })
})

function to_int(no){
    no=parseFloat(no,0);
        no=isNaN(no)?0:no;
        return no
}

//updating entry

function get_selected_results_row(){
rows=results_tab.querySelectorAll('.entry-row').forEach(row=>{
    row.addEventListener('click',e=>{
        window.selected_adm=row.querySelector('td').textContent;
        console.log(window.selected_adm);
    })
})
}



results_tab.querySelector('.delete-entry').addEventListener('click',e=>{
    if(window.selected_adm!=null ||window.selected_adm!=undefined ){
        data=[window.selected_adm];
        results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
            data.push(sel.value)
        });
        if(results_tab.querySelector('.paper-selector').value!=''){
        data.push(results_tab.querySelector('.paper-selector').value)
        console.log(data)
        data.push(document.querySelector('.registered-exams-selector').value)
        ipcRenderer.send('delete:entry',data)
        window.selected_adm=null;
        //delete entry here
    }else{
        show_alert('f-danger','Select paper')
    }
    }else{
        show_alert('f-danger','Select a row please')
    }
})


// results_tab.querySelector('.clear-all-entry').addEventListener('click',e=>{
//     data=[];
//         results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
//             data.push(sel.value)
//         });
//         if(results_tab.querySelector('.paper-selector').value!=''){
//         data.push(results_tab.querySelector('.paper-selector').value)
//         data.push(document.querySelector('.registered-exams-selector').value)
//         console.log(data);
//         ipcRenderer.send('clear:entry',data)
//         }else{
//             show_alert('f-danger','Select paper')
//         }
//         //clear all here
// })


results_tab.querySelector('.finalize-entries').addEventListener('click',e=>{
    data=[];
        results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
            data.push(sel.value)
        });
        data.push(results_tab.querySelector('.paper-selector').value)
        console.log(data);

        ipcRenderer.send('finalize:subject',data)
        // finalize here
})


//<tr class="entry-row"><td>5697</td><td>Francis</td><td>Wanyeki</td><td>45</td></tr>
// receiving and updating part 


ipcRenderer.on('init:results-tab',(e,data,papers,reload_paper)=>{
    results_tab.querySelector('.count_value').textContent=data.length
    window.selected_adm=null;
    exams2=papers.replace('1','');
    exams2=exams2.replace('1','');
    exams2=exams2.replace('1','');
    exams2=exams2.replace('1','');

   
 console.log(papers)
switch (papers.length-exams2.length) {
    case 2:
        results_tab.querySelector('.two-paper').style.display='contents'
        results_tab.querySelector('.three-paper').style.display='none'
        results_tab.querySelector('.one-paper').style.display='none'
        break;
    case 3:
        results_tab.querySelector('.two-paper').style.display='none'
        results_tab.querySelector('.three-paper').style.display='contents'
        results_tab.querySelector('.one-paper').style.display='none'
        break;

    default:
        results_tab.querySelector('.two-paper').style.display='none'
        results_tab.querySelector('.three-paper').style.display='none'
        results_tab.querySelector('.one-paper').style.display='contents'
        break;
}
papers=papers.replace('[','')
papers=papers.replace(']','')
papers=papers.split(',');

window.has_prac=papers[3]=='1';

paper_selector=results_tab.querySelector('.paper-selector');
if(reload_paper){
    exam_papers=['paper1','paper2','writing','practical']
    paper_selector.textContent='';
    opt1=document.createElement('option');
    opt1.setAttribute('value','')
    opt1.textContent='Select Paper';
    paper_selector.appendChild(opt1);
   
   console.log(papers)
    for(i=0;i<4;i++){
        if(papers[i]==1){
            opt=document.createElement('option');
            opt.setAttribute('value',exam_papers[i])
            opt.textContent=exam_papers[i];
            paper_selector.appendChild(opt)
        }
    }
    paper_selector.value='paper1'
   }
paper_selector=results_tab.querySelector('.paper-selector');
pp=paper_selector.value
 results_table=results_tab.querySelector('tbody')
 results_table.textContent='';
 data.forEach(entry=>{
     tr=document.createElement('tr');
     tr.classList.add('entry-row')
     for(let[key,value] of Object.entries(entry)){
       td=document.createElement('td');
       td.textContent=value
       if(pp==key){
           td.style.backgroundColor='skyblue'
       }
       tr.appendChild(td)
     }
     results_table.appendChild(tr)
 })
 add_entry_row();
 get_selected_results_row()


})

results_tab.querySelector('.pick-file').addEventListener('click',e=>{
data=[]
results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    data.push(sel.value)
});
data.push(document.querySelector('.registered-exams-selector').value)
data.push(results_tab.querySelector('.pp-sel').value)
    console.log(data)
    ipcRenderer.send('pick:results_file',data)

})

results_tab.querySelector('.open-sample').addEventListener('click',e=>{

ipcRenderer.send('open:results_sample')

})

document.querySelector('.registered-exams-selector').addEventListener('change',e=>{
    results_tab.querySelector('tbody').textContent=''
    results_tab.querySelector('.table-title').textContent='Ensure the above are selected correctly before Filling !';
    results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
        sel.value=''
    });
})