const electron= require('electron');
const{ipcRenderer,Menu}=electron;
const  {Titlebar,Color}=require('custom-electron-titlebar')

 new Titlebar({
   backgroundColor:Color.fromHex('#5F5687'),
   icon:'../assets/images/my logo.png'
 })

var chart=require('chart.js')
let tabs=document.querySelectorAll('.window');
let selectors=document.querySelectorAll('.selector');

function removeactive(){
    settings_close()
    selectors.forEach(selector=>{
        selector.classList.remove('active');
    })
}


days=['Sun ','Mon ','Tue ','Wed ','Thu ','Fri ','Sat '];
months=['Jan ','Feb ','March ','April ','May ','June ','July ','Aug ','Sep ','Oct ','Nov ','Dec ']
date=new Date;
day=days[date.getDay()];
today=date.getDate();
year=date.getFullYear();
month=months[date.getMonth()];
document.querySelector('.date').textContent=today;
document.querySelector('.day').textContent=day;
document.querySelector('.year').textContent=year;
document.querySelector('.month').textContent=month;

selectors.forEach(selector => {
    selector.addEventListener('click',()=>{
        clicked=selector.getAttribute('id');
        clicked=='teachers'?get_teachers('all'):false;
        clicked=='form1-enrollment'?get_form1():false;
        clicked=='perfomance'?get_graph1_data():false;
        tabs.forEach(tab=>{
            tab_name=tab.getAttribute('class').split(' ')[0];
            if(tab_name==clicked){
               tab.style.display='block';
               tab.classList.add('slideInLeft','faster');
               removeactive();
               selector.classList.add('active');
            }else{
                tab.style.display='none';
                tab.classList.remove('slideInLeft');
                
            }

        })
    })
    
});

// home

terminate_btn=document.querySelector('.terminate');
start_btn=document.querySelector('.start');
wizards=document.querySelector('.wizards');
cancel_btns=document.querySelectorAll('.cancel');

if(terminate_btn!=null){
terminate_btn.addEventListener('click',()=>{
    wizards.classList.remove('pulse');
    document.querySelector('.terminate-wizard').style.display='block';
    document.querySelector('.start-wizard').style.display='none';
    document.querySelector('.about').style.display='none';
    wizards.classList.add('pulse');
})}


if(start_btn!=null){
    start_btn.addEventListener('click',()=>{
        wizards.classList.remove('pulse');
        document.querySelector('.terminate-wizard').style.display='none';
        document.querySelector('.start-wizard').style.display='block';
        document.querySelector('.about').style.display='none';
        wizards.classList.add('pulse');
        
    })}

if(cancel_btns!=null){
        console.log('made with 💓 by francis')
        cancel_btns.forEach(btn=>{
            btn.addEventListener('click',()=>{
                wizards.classList.remove('pulse');
                document.querySelector('.terminate-wizard').style.display='none';
                document.querySelector('.start-wizard').style.display='none';
                document.querySelector('.finish').style.display='none';
                document.querySelector('.timetable').style.display='none';
                document.querySelector('.repeaters').style.display='block';
                document.querySelector('.about').style.display='block';
                wizards.classList.add('pulse');
            })
        })

    }

next_btns=document.querySelectorAll('.next');

if(next_btns!=null){
    next_btns.forEach(btn=>{
        
        btn.addEventListener('click',()=>{
        parent=btn.parentNode
        next=parent.getAttribute('id');
        parent.style.display='none';
        next_tab=document.querySelector('.'+next)
        next_tab.style.display='block';
        next_tab.classList.add('zoomIn','faster')
        })
        
    })
}

// generate_btn=document.querySelector('.generate-tt1');

// generate_btn.addEventListener('click',()=>{
//     generate_btn.classList.toggle('btn-success');
// })
function init_counts(std,tcr){
    const options = {
          startVal: 0,
          
        };
        let stu_count = new CountUp('students-n', std, options);
        if (!stu_count.error) {
          stu_count.start();
        } else {
          console.error(stu_count.error);
        }

    let te_count = new CountUp('teachers-n',tcr, options);
    if (!te_count.error) {
      te_count.start();
    } else {
      console.error(te_count.error);
    }
}
    //results


    entry_rows=document.querySelectorAll('.entry-row');
    results_change_btns=document.querySelectorAll('.change-entry');
    entry_modes=document.querySelectorAll('.entry-mode');
    cancel_entry_btns=document.querySelectorAll('.cancel-entry');

 function show_tab(tab_display,elm){
     parent=elm.parentNode.parentNode.parentNode.parentNode;
     console.log(parent)
     all_tabs=[
        parent.querySelector('.bulk-entry-tab'),  
        parent.querySelector('.add-entry-tab'),
        parent.querySelector('.update-entry-tab')
     ];
     i=0;
    all_tabs.forEach(tab=>{
        tab.style.display=tab_display[i];
        if(tab_display[i]=='block'){
            tab.classList.add('pulse')
        }else{
            tab.classList.remove('pulse');
        }
        i++;
    })
    
 }
    cancel_entry_btns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            show_tab(['none','block','none'],btn)
        })
    })
entry_modes.forEach(entry_mode=>{
    entry_mode.addEventListener('change',()=>{
      if(entry_mode.value=='2'){
        show_tab(['block','none','none'],entry_mode)
      }else{
        show_tab(['none','block','none'],entry_mode)
      }
    })
    });

    results_change_btns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            show_tab(['none','none','block'],btn)
        })
    });
function clear_selected_row(){
    entry_rows=document.querySelectorAll('.entry-row');
    entry_rows.forEach(row=>{
        row.style.background=null;
        row.style.color=null;
    })
}

function add_entry_row(){
    entry_rows=document.querySelectorAll('.entry-row');
     entry_rows.forEach(row=>{
        row.addEventListener('click',()=>{
            clear_selected_row();
            row.style.background='#EB7880';
            row.style.color='#fff';
            
        })
    })
}


   

//timetabling
tt_type2=document.querySelector('.tt-type2');
view_tt=document.querySelector('.view-tt')
cancel_view=document.querySelector('.cancel-view');
tt_type=document.querySelector('.tt-type')
tt_type.addEventListener('change',()=>{
    switch (tt_type.value) {
        case '1':
            show_tt(['block','none','none'])
          
            break;
         case '2':
            show_tt(['none','block','none'])
           
            break;
         case '3':
            show_tt(['none','none','block'])
            break;
    
        default:
            break;
    }
})

function show_tt(displays){
    tt_tabs=[
        document.querySelector('.teaching-tt'),
        document.querySelector('.exam-tt'),
        document.querySelector('.onduty-tt')
    ]
    i=0;
    displays.forEach(val=>{
        if(val=='block'){
            tt_tabs[i].style.display='block'
        }else{
            tt_tabs[i].style.display='none'
        }
        i++;
    })

}


view_tt.addEventListener('click',()=>{
    document.querySelector('.tt-view').style.display='block';
    document.querySelector('.tt-wizards').style.display='none';
})
cancel_view.addEventListener('click',()=>{
    document.querySelector('.tt-view').style.display='none';
    document.querySelector('.tt-wizards').style.display='block';
})

//report

cancel_repo_view=document.querySelector('.cancel-report-view');
repo_view=document.querySelector('.view-report');

cancel_repo_view.addEventListener('click',()=>{
    document.querySelector('.report-wizards').style.display='block';
    document.querySelector('.report-preview').style.display='none';

})
repo_view.addEventListener('click',()=>{
    document.querySelector('.report-wizards').style.display='none';
    document.querySelector('.report-preview').style.display='block';

})




// performance

function draw_graph2(drawing_data){
        count_tab=document.querySelector('#chart')
        count_tab.textContent=''
        var count = new Chart(count_tab, {
            type: 'bar',
            data: {
                labels: ['A', 'A-', 'B+', 'B', 'B-', 'C+','C', 'C-', 'D+', 'D', 'D-', 'E'],
                datasets:drawing_data
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }); 
    }

    function draw_graph1(drawing_data,labels){
        trend_tab=document.querySelector('#trend');
        trend_tab.textContent=''
        var trend = new Chart(trend_tab, {
            type: 'line',
            data: {
                labels: labels,
                datasets: drawing_data
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }); 

}
//enrollment

adm_checks=document.querySelectorAll('.adm-check');

adm_checks.forEach(check=>{
    check.addEventListener('change',()=>{
        par=check.parentNode;
        if(check.checked){
            par.querySelector('.adm-field').setAttribute('disabled','true');
            par.querySelector('.adm-field').value='auto'
        }else{
            par.querySelector('.adm-field').removeAttribute('disabled');
            par.querySelector('.adm-field').value=''
        }
    })
})




//settings

open_change_btns=document.querySelectorAll('.open-change');

open_change_btns.forEach(btn=>{
    par=btn.parentNode.parentNode.parentNode.parentNode;
    btn.addEventListener('click',()=>{
        // console.log(document.querySelector('.'+btn.getAttribute('id')))
       par.querySelectorAll('.entry-tab').forEach(tab=>tab.style.display='none');
       document.querySelector('.'+btn.getAttribute('id')).style.display='block';
    });
})


open_term_results=document.querySelectorAll('.open-term-results');
open_grouping=document.querySelectorAll('.open-groups');
open_settings=document.querySelectorAll('.open-settings');
open_selections=document.querySelectorAll('.open-selections');
open_exams=document.querySelectorAll('.open-exams');
open_remarks=document.querySelectorAll('.open-remarks');
open_subjects=document.querySelectorAll('.open-subjects');
close_settings=document.querySelectorAll('.close-settings');

open_finalized=document.querySelectorAll('.open-finalized');
open_insert=document.querySelectorAll('.open-insert');

open_settings.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(2);
        show_alert('f-success','settings opened')
    })
});
open_term_results.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(7);
    })
});
open_grouping.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(8);
        get_tt_subjects()
    })
});

ipcRenderer.on('open:settings',e=>{
    display_settings(2);
    show_alert('f-success','settings opened')
})

ipcRenderer.on('open-grouping',e=>{
    display_settings(8);
    get_tt_subjects()
})
ipcRenderer.on('open:finalized',e=>{
    display_settings(4);
})
open_selections.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(5);
    })
});

open_remarks.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(6);
        get_remarks()
    })
});

open_exams.forEach(btn=>{
    btn.addEventListener('click',()=>{
        sel=btn.parentNode.querySelector('.exam-selector').value;
        if(sel!=''){
            form=document.querySelector('.exam-form').value
            value=sel.split(' ');
            exam=value[0];
            term=value[1];
            ipcRenderer.send('get:exams',form,exam,term);
            ipcRenderer.send('initialize:index');
            display_settings(1);
         }else{
             btn.parentNode.querySelector('.error').style.display='block'
         }
    }) 
});
document.querySelector('.exam-form').addEventListener('change',e=>{
    sel=document.querySelector('.exam-selector').value;
    form=document.querySelector('.exam-form').value
            value=sel.split(' ');
            exam=value[0];
            term=value[1];
            ipcRenderer.send('get:exams',form,exam,term);
})
open_finalized.forEach(btn=>{
    btn.addEventListener('click',()=>{
        display_settings(4);
    })
});

open_insert.forEach(btn=>{
    btn.addEventListener('click',()=>{
        sel_exam=document.querySelector('.registered-exams-selector').value
        if(sel_exam==''){
            console.log(btn.parentNode)
            btn.parentNode.querySelector('.error').style.display='block';
        }else{
        display_settings(3);
        }
    })
});

open_subjects.forEach(btn=>{
    btn.addEventListener('click',()=>{
        get_teacher_subject('form-1');
        display_settings(0);
    })
});

function display_settings(tab){
    document.querySelector('.subjects').style.display='block';
    set_tabs=[
        document.querySelector('.subjects-tab'),
        document.querySelector('.exams-tab'),
        document.querySelector('.settings-tab'),
        document.querySelector('.insert-marks-tab'),
        document.querySelector('.view-finalized-tab'),
        document.querySelector('.selections-tab'),
        document.querySelector('.remarks-tab'),
        document.querySelector('.view-term-results-tab'),
        document.querySelector('.view-groups-tab')
    ]
    set_tabs.forEach(d_tab=>{
        d_tab.style.display='none';
    });
    set_tabs[tab].style.display='block';
    
    if(tab==2){
    ipcRenderer.send('get:configuration')
    }
}

close_settings.forEach(btn=>{
    btn.addEventListener('click',()=>{
       settings_close()

    })
});

function settings_close(){
    set_tab=document.querySelector('.subjects');
    set_tab.classList.add('animated','zoomOut','faster');
    setTimeout(()=>{
       set_tab.style.display='none'; 
       set_tab.classList.remove('animated','zoomOut','faster');
    },500);
    
}

ipcRenderer.on('close:settings',e=>{
  settings_close();
})
feedback=document.querySelector('.feedback')
f_text=document.querySelector('.f-text')

function show_alert(type,message){
   feedback.style.display='block' ;
   feedback.classList='';
   feedback.classList.add('feedback',type);
   f_text.textContent=message;

    setTimeout(()=>{
        feedback.style.display='none' ;
    },3000)
}
 
cancel_loading_btn=document.querySelector('.cancel-load')

cancel_loading_btn.addEventListener('click',()=>{
    cancel_loading();
})
loading=document.querySelector('.loader')

function show_loading(title){
    loading.style.display='block';
    document.querySelector('.load-title').textContent=title;
}
function cancel_loading(){
    loading.style.display='none';
    show_alert('f-success','finished')
}
function set_loading_text(action_text){
    document.querySelector('.load-actions').innerHTML=action_text;
}

ipcRenderer.on('show:loading',(e,msg)=>{
    show_loading(msg)
})

ipcRenderer.on('set:loading_text',(e,msg)=>{
    set_loading_text(msg)
})

ipcRenderer.on('close:loading',(e)=>{
    cancel_loading()
})


document.querySelector('.chg-psd').addEventListener('click',()=>{
    type=1
    ipcRenderer.send('open:manager',type);
});

document.querySelector('.new-user').addEventListener('click',()=>{
    type=2
    ipcRenderer.send('open:manager',type);
});

ipcRenderer.on('alert:message',(e,data)=>{
    show_alert(data.type,data.message)
})

ipcRenderer.send('get:username')
ipcRenderer.on('set:username',(e,username)=>{
    console.log(username)
    document.querySelector('.top-username').textContent=username
})


document.querySelector('.logout').addEventListener('click',()=>{
    ipcRenderer.send('logout:user')
    
});


function go_settings_home(){
    settings_tabs=document.querySelectorAll('.settings-right .entry-tab');
    settings_tabs.forEach(s_tab=>{
        s_tab.style.display='none';
    })
    home_settings_tab=document.querySelector('.settings-right .add-entry-tab');
    home_settings_tab.style.display='block';

}


