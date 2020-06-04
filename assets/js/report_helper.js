
remarks_tab=document.querySelector('.remarks-tab')
const pat=require('path')
//get remarks
function get_remarks(){
    ipcRenderer.send('get:remarks')
}

ipcRenderer.on('show:remarks',(e,data)=>{
    remarks_table=remarks_tab.querySelector('tbody')
    remarks_table.textContent=''
    data.forEach(points => {
     tr=document.createElement('tr');
     td=document.createElement('td');
     td.textContent=points.points;  
     td2=document.createElement('td');
     input=document.createElement('input');
     input.value=points.remarks
    
     td2.appendChild(input); 

     tr.appendChild(td)
     tr.appendChild(td2)
     remarks_table.appendChild(tr)
    });
})

remarks_tab.querySelector('.save-remarks').addEventListener('click',e=>{
    data=[]
    inputs=remarks_tab.querySelectorAll('input');
    inputs.forEach(input=>{
        remarks_map={
            points:input.parentNode.parentNode.querySelector('td').textContent,
            remarks:input.value
        }
        data.push(remarks_map)
    })

    ipcRenderer.send('update:remarks',data)
})

report_tab=document.querySelector('.report-cards');


//generate report
report_tab.querySelector('.generate-report').addEventListener('click',e=>{
    data={
        form:report_tab.querySelector('.report-form').value,
        class:report_tab.querySelector('.report-stream').value,
        term:report_tab.querySelector('.select-term').value
    }

    if(data.class==''){
        report_tab.querySelector('.error').style.display='block'
    }else{
        console.log(data)
        ipcRenderer.send('generate:reports',data);
    }
})

term_sel=report_tab.querySelector('.select-term')

for(i=1;i<4;i++){
term_opt=document.createElement('option')
termm='term-'+i+'-'+year
term_opt.setAttribute('value',termm)
term_opt.textContent=termm;
term_sel.appendChild(term_opt);
}


report_tab.querySelector('.balance-upload').addEventListener('click',e=>{
    entry_mode=report_tab.querySelector('.entry-mode')
    show_tab(['block','none','none'],entry_mode)
})

report_tab.querySelector('.pick-file').addEventListener('click',e=>{

        console.log('yes')
        ipcRenderer.send('pick:balance_file')
    
})

report_tab.querySelector('.open-sample').addEventListener('click',e=>{

    ipcRenderer.send('open:balance_sample')

})

ipcRenderer.on('generate:report_notification',(e,path)=>{
    const notification={
        title:'Reports generated',
        body:'Click here to see the reports',
        icon: pat.join(__dirname,'../assets/images/my logo.png'),
        
    }
console.log(notification.icon)
    const notify=new window.Notification(notification.title,notification)
    notify.onclick=()=>{
        console.log('clicked')
        ipcRenderer.send('open:folder',path)
    }

})