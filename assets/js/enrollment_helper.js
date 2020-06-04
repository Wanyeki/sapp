function get_form1(){
    console.log()
    ipcRenderer.send('get:form1')
    console.log('getting')
}

en_tab=document.querySelector('.form1-enrollment .results-content');




//add form1
en_tab.querySelector('.save-form1').addEventListener('click',e=>{
    data=[];
    en_tab.querySelectorAll('.add-entry-tab input[type="text"]').forEach(inp=>{
        data.push(inp.value)
    })
      en_tab.querySelectorAll('.add-entry-tab input[type="radio"]').forEach(rad=>{
        if(rad.checked){
            data.push(rad.value)
        }})
    with_err=false
    for(i=0;i<data.length;i++){
        if(data[i]==''){
            with_err=true;
        }
    }
    if(data.length<8){
        with_err=true
    }
    if(with_err){
        en_tab.querySelector('.add-entry-tab .error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('save:form1',data)
        en_tab.querySelectorAll('.add-entry-tab .clear').forEach(inp=>{
            inp.value=''
        })
    }
});




function get_selected_form1(){
    rows=en_tab.querySelectorAll('.entry-row').forEach(row=>{
        row.addEventListener('click',e=>{
            window.selected_form1=row.querySelector('td').textContent;
            console.log(window.selected_form1);
        })
    })
    }

//delete form1
en_tab.querySelector('.delete-entry').addEventListener('click',e=>{
    if(window.selected_form1!=null ||window.selected_form1!=undefined ){
        console.log(window.selected_form1);
        data={
            adm:window.selected_form1,
        }
        console.log(data)
        ipcRenderer.send('delete:form1',data)
        //delete here
    }else{
        show_alert('f-danger','Select a row please')
    }
})

 //display table

 ipcRenderer.on('display:form1',(e,form1s)=>{
    en_tab.querySelector('.count_value').textContent=form1s.length
    window.selected_form1=null;
    form1_table=en_tab.querySelector('tbody');
    form1_table.textContent='';
    form1s.forEach(form1=>{
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        for(let[key,value] of Object.entries(form1)){
            td=document.createElement('td');
            td.textContent=value;
            tr.appendChild(td)
        }
        form1_table.appendChild(tr)
    })

    add_entry_row();
    get_selected_form1()
});

en_tab.querySelector('.commit-form1').addEventListener('click',e=>{
    ipcRenderer.send('commit:form1')
})


en_tab.querySelector('.pick-file').addEventListener('click',e=>{

    ipcRenderer.send('pick:form1_file')

})

en_tab.querySelector('.open-sample').addEventListener('click',e=>{

ipcRenderer.send('open:form1_sample')

})