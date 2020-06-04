

finalized_tab=document.querySelector('.view-finalized-tab')


//selectors change
sopt=document.createElement('option');
sopt.setAttribute('value','all')
sopt.textContent='All'
finalized_tab.querySelector('.stream-selector').appendChild(sopt)
finalized_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    sel.addEventListener('change',e=>{
        finalized_tab.querySelector('tbody').textContent=''
        data={
            form:finalized_tab.querySelector('.form-selector').value,
            class:finalized_tab.querySelector('.stream-selector').value,
            exam:finalized_tab.querySelector('.registered-exams-selector').value
        }
        if(data.form=='' || data.class=='' || data.exam==''){
            finalized_tab.querySelector('.results-title').textContent="Select a class here above";
           
        }else{
            console.log(data)
            
            ipcRenderer.send('get:all_results',data)
            ///send request here
        }
    })
});


//search student


finalized_tab.querySelector('#search-student').addEventListener('keyup',e=>{
    search_text= finalized_tab.querySelector('#search-student').value;
    data={
        form:finalized_tab.querySelector('.form-selector').value,
        search_text:search_text,
        exam:finalized_tab.querySelector('.registered-exams-selector').value
    }
    if(data.exam==''){
        show_alert('f-danger','Select an exam please')
    }else{
    console.log(data)
    ipcRenderer.send('search:student_result',data)
    }
})



    //display table

    ipcRenderer.on('display:students_results',(e,results,subjects)=>{
        window.subjects=subjects.map(sb=>{
            sb.name=sb.name[0]+sb.name[1]+sb.name[2];
            return sb

        })
        finalized_tab.querySelector('.results-title').textContent="Results "+finalized_tab.querySelector('.form-selector').value+' '+
        finalized_tab.querySelector('.stream-selector').value;
        
        row_head=finalized_tab.querySelector('.title-row')
        row_head.textContent=''
        th6=document.createElement('th')
        th6.textContent='no'
        th3=document.createElement('th')
        th3.textContent='Adm'
        th4=document.createElement('th')
        th4.textContent='F-name'
        th5=document.createElement('th')
        th5.textContent='M-name'

        row_head.appendChild(th6);
        row_head.appendChild(th3);
        row_head.appendChild(th4)
        row_head.appendChild(th5)

        subjects.forEach(subj=>{
            th=document.createElement('th');
            th.textContent=subj.name[0]+subj.name[1]+subj.name[2];
            row_head.appendChild(th)
        });
       th1=document.createElement('th')
       th1.textContent='Total'
       th2=document.createElement('th')
       th2.textContent='Points'
       row_head.appendChild(th1);
       row_head.appendChild(th2)
       th6=document.createElement('th')
       th6.textContent='Grade'
       row_head.appendChild(th6);
        
        table=finalized_tab.querySelector('tbody')
        table.textContent='';
        i=1
        j=0
        window.current_results=[]
        results.forEach(student=>{
            row=[]
            tr=document.createElement('tr');
            tr.classList.add('entry-row');
            td2=document.createElement('td');
            td2.textContent=i;
            tr.appendChild(td2)
            for(let[key,value] of Object.entries(student)){
                td=document.createElement('td');
                td.textContent=value;
                row.push(value)
                tr.appendChild(td)
            }
            window.current_results.push(row)
            table.appendChild(tr)
            
      results[j+1] && results[j].total_marks==results[j+1].total_marks?false:i++
       j++
    })
    });

//graphing .................................


//get graph_data

function get_graph1_data(initial=true,data={
    form:perfomance_tab.querySelector('.form-selector-graph').value,
    exam:perfomance_tab.querySelector('.registered-exams-selector').value
    }){
        if(initial){
            draw_graph2([{
                label:'no data (try selecting an exam)',
                data:[0],
                backgroundColor:'#302655'
            }])
        }
    console.log(data)
    ipcRenderer.send('get:graph1_data',data)
}
function get_graph2_data(data){
   
    if(data.exam==''){
        show_alert('f-danger','select an exam')
    }else{
    ipcRenderer.send('get:graph2_data',data)
    }
   }

perfomance_tab=document.querySelector('.perfomance .perfomance-content')

perfomance_tab.querySelector('.form-selector-graph').addEventListener('change',e=>{
    data={
        form:perfomance_tab.querySelector('.form-selector-graph').value,
        exam:perfomance_tab.querySelector('.registered-exams-selector').value
        }
    get_graph1_data(false,data);
    get_graph2_data(data)
})

perfomance_tab.querySelector('.registered-exams-selector').addEventListener('change',e=>{
    data={
    form:perfomance_tab.querySelector('.form-selector-graph').value,
    exam:perfomance_tab.querySelector('.registered-exams-selector').value
    }

    get_graph2_data(data)  
})


//draw graph1
ipcRenderer.on('draw:graph1',(e,data)=>{
 labels=[];
 drawing_data=[]
 colors=['#302655','#EB7880','rgb(91, 77, 196)','green']
    i=0
    data.forEach(term => {
       j=0
        for(let[key,value] of Object.entries(term)){
            if(i==0){
                if(j>1){
                drawing_data.push({
                    label:key,
                    data:[value],
                    backgroundColor:'transparent',
                    borderColor:colors[j-2]
                })}
            }else{
                if(j>1){
                drawing_data[j-2].data.push(value)
                }
            }
        j++
        }
        labels.push(term.term.replace('erm','')+' '+term.exam)
        if(i==(data.length-1)){
            draw_graph1(drawing_data,labels)
        }
        i++
    });

})


//draw graph2
ipcRenderer.on('draw:graph2',(e,data)=>{
    console.log(data)
    if(data.length==0){
        draw_graph2([{
            label:'no data(select an exam)',
            data:[0],
            backgroundColor:colors[0]
        }])
    }
    drawing_data=[]
    colors=['#302655','#EB7880','rgb(91, 77, 196)','green']
    i=0
    data.forEach(stream => {
        class_data={
            label:stream.class,
            data:[],
            backgroundColor:colors[i]
        }
        j=0;
        for(let[key,value] of Object.entries(stream)){
            if(j>1){
                class_data.data.push(value)
            }
            j++
        }
        drawing_data.push(class_data);
        if(i==(data.length-1)){
            
            draw_graph2(drawing_data)
        }
      i++  
    });
   
    
})


  //print finalized
  finalized_tab.querySelector('.print_finalized').addEventListener('click',e=>{
    dt={ form :finalized_tab.querySelector('.form-selector').value,
     class:finalized_tab.querySelector('.stream-selector').value,
    exam:finalized_tab.querySelector('.registered-exams-selector').value}
     
     show_loading('Printing')
       ipcRenderer.send('print:finalized',{
           title:dt,
           subjects:window.subjects,
           rows:window.current_results
       })
       

   })



   //term results............................................................................


   

term_results_tab=document.querySelector('.view-term-results-tab')


//selectors change
sopt=document.createElement('option');
sopt.setAttribute('value','all')
sopt.textContent='All'
term_results_tab.querySelector('.stream-selector').appendChild(sopt)
term_results_tab.querySelectorAll('.x-selectors .x-selector').forEach(sel => {
    sel.addEventListener('change',e=>{
        request_results_data()
    })
});
term_results_tab.querySelector('.year_input').value=year;

function request_results_data(){
    term_table=term_results_tab.querySelector('tbody').textContent='';
    data={
        form:term_results_tab.querySelector('.form-selector').value,
        class:term_results_tab.querySelector('.stream-selector').value,
        term:term_results_tab.querySelector('.term-sel').value+term_results_tab.querySelector('.year_input').value,
       
    }
    if(data.form=='' || data.class=='' ||data.term.length<9){
        term_results_tab.querySelector('.results-title').textContent="Select a class here above";
       
    }else{
        console.log(data)
       
        ipcRenderer.send('get:term_results',data)
        ///send request here
    }
}

term_results_tab.querySelector('.year_input').addEventListener('keyup',request_results_data)
//search student


term_results_tab.querySelector('#search-student').addEventListener('keyup',e=>{
    search_text= term_results_tab.querySelector('#search-student').value;
    data={
        form:term_results_tab.querySelector('.form-selector').value,
        search_text:search_text,
        term:term_results_tab.querySelector('.term-sel').value+term_results_tab.querySelector('.year_input').value,
    }
    if(data.term.length<9){
        show_alert('f-danger','Select year and term please')
    }else{
    console.log(data)
    ipcRenderer.send('search:term_results',data)
    }
})


//displaying table


ipcRenderer.on('display:term_results',(e,term_results)=>{
    window.current_term_results=term_results;
    term_table=term_results_tab.querySelector('tbody');
    term_table.textContent='';
    n=1
    term_results.forEach(t_res=>{
        t_res.no=n
        tr=document.createElement('tr');
        tr.classList.add('entry-row');
        for(let[key,value] of Object.entries(t_res)){
            td=document.createElement('td');
            td.textContent=value;
            tr.appendChild(td)
        }
        term_table.appendChild(tr)
        n++
    })


});

  //print class list
  term_results_tab.querySelector('.print_term_results').addEventListener('click',e=>{
    dt={ form:term_results_tab.querySelector('.form-selector').value,
    class:term_results_tab.querySelector('.stream-selector').value,
    term:term_results_tab.querySelector('.term-sel').value+term_results_tab.querySelector('.year_input').value,}
     window.current_term_results[0]? window.current_term_results[0].title=dt:window.current_term_results[0]={title:dt}
     show_loading('Printing')
       ipcRenderer.send('print:term_results',window.current_term_results)
       

   })