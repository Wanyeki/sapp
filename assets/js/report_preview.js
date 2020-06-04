

re_preview_tab=document.querySelector('.report-preview')

re_preview_tab.querySelector('.print-all-reports').addEventListener('click',e=>{
    re_preview_tab.querySelector('.cancel-report-view').click()
    document.querySelector('.gnrtrp').click()
})


// print current preview
re_preview_tab.querySelector('.adm_field').addEventListener('keyup',e=>{
 request_report_preview()
})
re_preview_tab.querySelector('.select-term').addEventListener('change',e=>{
    request_report_preview()
   })
function request_report_preview(){
    re_preview_tab.querySelector('.real-report').style.display='none';  
    data={
        adm:re_preview_tab.querySelector('.adm_field').value,
        term:re_preview_tab.querySelector('.select-term').value+year
     }
     if(data.adm==''){
     show_alert('f-danger','enter the adm no')
     }else{
     console.log(data)
     ipcRenderer.send('view_report',data);
     }
}

re_preview_tab.querySelector('.print_this').addEventListener('click',e=>{
    data={
       adm:re_preview_tab.querySelector('.adm_field').value,
       term:re_preview_tab.querySelector('.select-term').value+year
    }
    if(data.adm==''){
        show_alert('f-danger','enter the adm no')
        }else{
        console.log(data)
        show_loading('Printing')
        ipcRenderer.send('print_this',data);
        }
   })


ipcRenderer.on('draw:report',(e,data)=>{
    console.log(data)
    re_preview_tab.querySelector('.real-report').style.display='block';

    re_preview_tab.querySelector('.term').textContent=data.term
    re_preview_tab.querySelector('.names').textContent=`${data.student.first_name} ${data.student.middle_name } ${data.student.sir_name }`
    re_preview_tab.querySelector('.adm').textContent=data.student.adm
    re_preview_tab.querySelector('.class').textContent=`${data.student.form} ${data.student.class}`
    re_preview_tab.querySelector('.parent').textContent=data.student.parent_phone;

    top_table=re_preview_tab.querySelector('.results-table-rt tbody')
    top_table.textContent=''
    data.top_table.forEach(t_row => {
        
        tr=document.createElement('tr')
        td1=document.createElement('td')
        td1.textContent=t_row.subject
        tr.appendChild(td1)

        td2=document.createElement('td')
        td2.textContent=t_row.Endt
        tr.appendChild(td2)

        td3=document.createElement('td')
        td3.textContent=t_row.Openert
        tr.appendChild(td3)

        td4=document.createElement('td')
        td4.textContent=t_row.Midt
        tr.appendChild(td4)

        td5=document.createElement('td')
        td5.textContent=t_row.grade
        tr.appendChild(td5)

        td6=document.createElement('td')
        td6.textContent=t_row.mean_points
        tr.appendChild(td6)

        td7=document.createElement('td')
        td7.textContent=t_row.rnk+'/'+t_row.out_of
        tr.appendChild(td7)

        td8=document.createElement('td')
        td8.textContent=t_row.remarks
        tr.appendChild(td8)

        td9=document.createElement('td')
        td9.textContent=t_row.teacher
        tr.appendChild(td9)
        top_table.appendChild(tr)

    });
//totals
    tr=document.createElement('tr')
    td1=document.createElement('td')
    td1.textContent='Totals'
    tr.appendChild(td1)

    td2=document.createElement('td')
    td2.textContent=data.totals_row[0].endt
    tr.appendChild(td2)

    td3=document.createElement('td')
    td3.textContent=data.totals_row[0].openert
    tr.appendChild(td3)

    td4=document.createElement('td')
    td4.textContent=data.totals_row[0].midt
    tr.appendChild(td4)

    td5=document.createElement('td')
    td5.textContent=data.totals_row[0].grade
    tr.appendChild(td5)

    td6=document.createElement('td')
    td6.textContent=data.totals_row[0].points
    tr.appendChild(td6)

    td7=document.createElement('td')
    td7.textContent=data.totals_row[0].rnk+'/'+data.totals_row[0].outof
    tr.appendChild(td7)

    td8=document.createElement('td')
    td8.textContent=''
    td8.setAttribute('colspan','2')
    tr.appendChild(td8)
    re_preview_tab.querySelector('.tt2').textContent=''
    re_preview_tab.querySelector('.tt2').appendChild(tr)

    i=0
    data.mid_table.forEach(trm_perfomance=>{
        tr=document.createElement('tr')
        td4=document.createElement('td')
        td4.textContent=i==0?'This term':'Last term';
        tr.appendChild(td4)
    
        td5=document.createElement('td')
        td5.textContent=trm_perfomance.points
        tr.appendChild(td5)
    
        td6=document.createElement('td')
        td6.textContent=trm_perfomance.grade
        tr.appendChild(td6)
    
        td7=document.createElement('td')
        td7.textContent=trm_perfomance.pos+'/'+trm_perfomance.class_outof
        tr.appendChild(td7)
    
        td8=document.createElement('td')
        td8.textContent=trm_perfomance.rnk+'/'+trm_perfomance.form_outof
        tr.appendChild(td8)
        re_preview_tab.querySelector('.tt3').textContent=''
        re_preview_tab.querySelector('.tt3').appendChild(tr)
        i++;
    })

    tr=document.createElement('tr')
    td4=document.createElement('td')
    td4.textContent='KCPE';
    tr.appendChild(td4)

    td5=document.createElement('td')
    td5.textContent=data.kcpe_ranks[0].points
    tr.appendChild(td5)

    td6=document.createElement('td')
    td6.textContent=data.kcpe_ranks[0].grade
    tr.appendChild(td6)

    td7=document.createElement('td')
    td7.textContent=data.kcpe_ranks[0].pos+'/'+data.kcpe_ranks[0].class_outof
    tr.appendChild(td7)

    td8=document.createElement('td')
    td8.textContent=data.kcpe_ranks[0].rnk+'/'+data.kcpe_ranks[0].form_outof
    tr.appendChild(td8)
    re_preview_tab.querySelector('.tt4').textContent=''
    re_preview_tab.querySelector('.tt4').appendChild(tr)

    tr=document.createElement('tr')
    td4=document.createElement('td')
    td4.textContent='KCPE  :'+data.kcpe_ranks[0].kcpe;
    td4.setAttribute('colspan','2')
    tr.appendChild(td4)

    td5=document.createElement('td')
    td5.textContent='Value Added: '+(Math.round( (data.mid_table[0].points-data.kcpe_ranks[0].points)*100)/100)
    tr.appendChild(td5)
    td5.setAttribute('colspan','3')
    re_preview_tab.querySelector('.tt4').appendChild(tr)

    re_preview_tab.querySelector('.trms').textContent=''
    data.the_graph.forEach(trm=>{
        h1=document.createElement('h5')
        h1.textContent=trm.term;
        h1.classList.add('term')
         h1.style.fontSize='xx-small'
        re_preview_tab.querySelector('.trms').appendChild(h1)
    })
    re_preview_tab.querySelector('.brs').textContent=''
    data.the_graph.forEach(trm=>{
        h1=document.createElement('div')
        h1.textContent=trm.mean_points;
        h1.classList.add('width')
        h1.style.width=Math.round(trm.width)+'%'
       
        re_preview_tab.querySelector('.brs').appendChild(h1)
    })
    let g_rows=data.the_graph.length;
    g_m_top=(8-g_rows)*17
    if(g_m_top<0){
        g_m_top=0
    }
    re_preview_tab.querySelector('.g_bot').textContent=data.kcpe_ranks[0].points
    re_preview_tab.querySelector('.g_bot').style.width=data.kcpe_ranks[0].width+'%'
    re_preview_tab.querySelector('.graph').style.marginTop=g_m_top+'px'


    let btm_data=[]
    for(i=0;i<data.bottom_table.length;i++){
        btm_data.push(data.bottom_table[i])
        if(i==7){
            break
        }
    }

    re_preview_tab.querySelector('.cls').textContent=''
    btm_data.forEach(b=>{
        td=document.createElement('td')
        td.textContent=b.form
        re_preview_tab.querySelector('.cls').appendChild(td)
    })
    re_preview_tab.querySelector('.yar').textContent=''
    btm_data.forEach(b=>{
        td=document.createElement('td')
        td.textContent=b.term
        re_preview_tab.querySelector('.yar').appendChild(td)
    })
    re_preview_tab.querySelector('.exm').textContent=''
    btm_data.forEach(b=>{
        td=document.createElement('td')
        td.textContent=b.exam
        re_preview_tab.querySelector('.exm').appendChild(td)
    })
    re_preview_tab.querySelector('.mg').textContent=''
    btm_data.forEach(b=>{
        td=document.createElement('td')
        td.textContent=b.points
        re_preview_tab.querySelector('.mg').appendChild(td)
    })

    if(data.balances.length>0){
        re_preview_tab.querySelector('.blc').textContent=data.balances[0].balance
        re_preview_tab.querySelector('.nt').textContent=data.balances[0].next_term
        re_preview_tab.querySelector('.mg').textContent=data.balances[0].balance+data.balances[0].next_term

    }
})