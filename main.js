const { app, BrowserWindow,ipcMain,Menu,dialog,shell} = require('electron');
const Login_controller= require('./login_controller');
const settings_controller=require('./assets/js/settings_controller')
const results_controller=require('./assets/js/results_controller')
const students_controller=require('./assets/js/students_controller')
const teachers_controller=require('./assets/js/teachers_controller')
const timetable_controller=require('./assets/js/timetable_controller')
const enrollment_controller=require('./assets/js/enrollment_controller')
const perfomance_controller=require('./assets/js/perfomance_controller')
const report_controller=require('./assets/js/report_controller')
const read_excells=require('./assets/js/read_excells')
const table_printing=require('./assets/js/table_printing')
const purchaser=require('./assets/js/purchaser')
//require('update-electron-app')()

let tt_process;
function open_tt_process(){
  tt_process=new BrowserWindow({
    show:false,
    webPreferences:{
      nodeIntegration:true
    }
  })
  tt_process.loadFile('./screens/tt.html');
  }
app.on('ready',()=>{ 
  if(Login_controller.is_valid()){
    open_login()
  }else{
 open_purchase()
  }
 const main_menu=Menu.buildFromTemplate(menu_template);
 Menu.setApplicationMenu(main_menu) 
});
const menu_template=[
  {
    label:'File',
    submenu:[
      {label:'logout',
        click:()=>{logout()}},
      {label:'New user',
        click:()=>{open_user_management(0)}},
        {label:'View results',
        click:()=>{open_finalized()}},
        // {
        //   label: 'Dev Tools',
        //   accelerator: (() => {
        //     if (process.platform === 'darwin') {
        //       return 'Alt+Command+I'
        //     } else {
        //       return 'Ctrl+Shift+I'
        //     }
        //   })(),
        //   click: (item, focusedWindow) => {
        //     if (focusedWindow) {
        //       focusedWindow.toggleDevTools()
        //     }
        //   }
        // }
    ]
  },
  {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  },
  {
    label:'Window',
    submenu:[
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(win => {
                if (win.id > 1) win.close()
              })
            }
            focusedWindow.reload()
          }
        }
      },
      {
        label: 'Full Screen',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F'
          } else {
            return 'F11'
          }
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        }
      }
    ]
  },
  {
    label:'Help',
    submenu:[
      {label:'About',
      click:()=>{show_my_details()}},
      {label:'Developer',
      click:()=>{shell.openExternal('http://wanyekifs.netlify.com')}}
    ]
  },
  {
    label:'Settings',
    click:()=>{open_settings()}
    
  },
  
]

function show_my_details(){
  const options = {
    type: 'info',
    title: 'About Software',
    message: "Made with 💓 by francis wanyeki.",
    buttons: ['Learn more', 'cancel'],
    detail:"For enquiry, help,suggestions,modifications email me at wanyekifs@outlook.com"
  }

 dialog.showMessageBox(null,options).then(response=>{
   if(response.response==0){
     shell.openExternal('http://wanyekifs.netlify.com')
   }
 })

}
let login_screen;
function open_login(){
  login_screen=new BrowserWindow({
    frame:false,
    width: 430,
    height: 550,
    webPreferences:{
      nodeIntegration:true
    }
  })
  login_screen.loadFile('./screens/login.html');
  }

 

  let purchase_screen;
function open_purchase(){
  purchase_screen=new BrowserWindow({
    frame:false,
    width: 350,
    height: 380,
    webPreferences:{
      nodeIntegration:true
    }
  })
  purchase_screen.loadFile('./screens/purchase.html');
  }
  ipcMain.on('close:purchase',e=>{
    purchase_screen.close()
  })

  let index_screen;
function open_index(){
    index_screen=new BrowserWindow({
      frame:false,
      width: 1260,
      height: 670,
      webPreferences:{
        nodeIntegration:true
      }
    });
    index_screen.loadFile('./screens/index.html')
    index_screen.on('close',e=>{
      management_screen? management_screen.close():false
     tt_process? tt_process.close(): false
     })
  }

  function open_settings( ){
    index_screen.webContents.send('open:settings')

  }

  function open_finalized( ){
    index_screen.webContents.send('open:finalized')

  }
let management_screen;
  function open_user_management(type){
    management_screen=new BrowserWindow({
      width: 417,
      height: 500,
      webPreferences:{
        nodeIntegration:true
      }
    });
   if(type==1){
    management_screen.loadFile('./screens/change_psd.html');

   }else{

    
    management_screen.loadFile('./screens/create_user.html');

   }
  }

 
  //login
  ipcMain.on('login:user',(e,login_data)=>{
    login=Login_controller.login(login_data,open_index,login_screen)
  });

  ipcMain.on('open:manager',(e,type)=>{

   open_user_management(type) 
  })
  
  ipcMain.on('get:users',e=> {
    Login_controller.list_users(management_screen);
  })


  ipcMain.on('create:user',(e,form_data)=>{
    Login_controller.create_user(form_data,management_screen,index_screen)
  })

  ipcMain.on('remove:user',(e,id)=>{
    Login_controller.remove_user(id,index_screen)
    users=Login_controller.list_users(management_screen);
    management_screen.webContents.send('display:userTable',users)
  })

  ipcMain.on('change:password',(e,form_data)=>{
    Login_controller.change_password(form_data,index_screen)
    management_screen.close()
  })

  ipcMain.on('get:username',e=>{
    username=Login_controller.Username;
    index_screen.webContents.send('set:username',username)
  })
  ipcMain.on('check:purchase_code',(e,code)=>{
 purchaser.check_code(purchase_screen,code,open_login)
  })

function logout(){
  const options={
    type:'question',
    title:'User Management',
    message:'Are You sure You want to logout?',
    buttons:['Logout','Cancel']
}
dialog.showMessageBox(null,options).then(response=>{
    if(response.response==0){
      open_login()
      index_screen.close()
    }
})
  
}

  ipcMain.on('logout:user',e=>{
  logout()
  })

  ipcMain.on('close:login',e=>{
    login_screen.close()
  })

  //settings

  ipcMain.on('get:configuration',e=>{
    callback=result=>{index_screen.webContents.send('set:configurations',result)}
    table='configurations'
    settings_controller.get_all(callback,table)
  })
  ipcMain.on('get:streams',e=>{
    callback=result=>{index_screen.webContents.send('set:streams',result)}
    table='streams'
    settings_controller.get_all(callback,table)
  })
  ipcMain.on('get:subjects',e=>{
    callback=result=>{index_screen.webContents.send('set:subjects',result)}
    table='subjects'
    settings_controller.get_all(callback,table)
  })

  ipcMain.on('get:groups',e=>{
    settings_controller.get_groups(index_screen)
  });

  ipcMain.on('get:grading',e=>{
    settings_controller.get_grading(index_screen)
  });

  ipcMain.on('get:exams',(e,form,exam,term,type)=>{
    settings_controller.get_exams_subjects(index_screen,form,exam,term)
  })

  ipcMain.on('save:home_settings',(e,values)=>{
    settings_controller.save_home_settings(index_screen,values)
  });

  ipcMain.on('save:stream',(e,stream)=>{
    settings_controller.save_stream(index_screen,stream)
  });
  ipcMain.on('save:subject',(e,subject)=>{
    settings_controller.save_subject(index_screen,subject)
  });

  ipcMain.on('update:subjects',(e,subjects,values,electives)=>{
    settings_controller.update_subjects(index_screen,subjects,values,electives)
  })


  ipcMain.on('initialize:index',(e)=>{
    settings_controller.initialize_subject_selectors(index_screen);
    settings_controller.select_non_finalized_Exams(index_screen);
    settings_controller.init_term(index_screen);
    settings_controller.count_students_teachers(index_screen)
// init streams
    callback=result=>{index_screen.webContents.send('set:streams',result)}
    table='streams'
    settings_controller.get_all(callback,table)
  });
  ipcMain.on('save:group',(e,group)=>{
    settings_controller.save_group(index_screen,group)
  });

  ipcMain.on('update:grading',(e,subjects,values)=>{
    settings_controller.update_grading(index_screen,subjects,values)
  });

  ipcMain.on('update:exams',(e,data,exam_term,form)=>{
    settings_controller.update_exams(index_screen,data,exam_term,form)
  });
  ipcMain.on('register:term',(e,term,migrate)=>{
    settings_controller.register_term(index_screen,term,migrate)
  });
  ipcMain.on('terminate:term',(e)=>{
    settings_controller.terminate_term(index_screen)
  });




  //results

  ipcMain.on('get:res-table',(e,data,reload_table)=>{
    results_controller.get_res_table(index_screen,data,reload_table)
  }); 


  ipcMain.on('save:entry',(e,data)=>{
    results_controller.save_entry(index_screen,data)
  }); 

  ipcMain.on('delete:entry',(e,data)=>{
    results_controller.delete_entry(index_screen,data);
  }); 

  
  ipcMain.on('pick:results_file',(e,class_data)=>{
    read_excells.open_excells(data=>results_controller.upload_from_excell(data,index_screen,class_data),index_screen);
  });

  ipcMain.on('open:results_sample',(e,data)=>{
    index_screen.webContents.send('show:loading','Opening');
   shell.openItem(__dirname+'/assets/excell_samples/results.xlsx')
   setTimeout(()=>{
    index_screen.webContents.send('close:loading');
    shell.openItem(__dirname+'/assets/excell_samples/results.xlsx')
   },3000)
  });

  // ipcMain.on('clear:entry',(e,data)=>{
  //   results_controller.clear_results(index_screen,data);
  // })

  //students

  ipcMain.on('get:students',(e,data)=>{
    students_controller.get_students(index_screen,data);
  });

  ipcMain.on('update:student',(e,data)=>{
    students_controller.update_student(index_screen,data);
  })

  ipcMain.on('delete:student',(e,data)=>{
    students_controller.delete_student(index_screen,data);
  })

  ipcMain.on('search:student',(e,data)=>{
    students_controller.search_student(index_screen,data);
  })
  ipcMain.on('save:student',(e,data)=>{
    students_controller.save_student(index_screen,data);
  })
  ipcMain.on('get:update_details',(e,data)=>{
    students_controller.get_update(index_screen,data);
  });
  ipcMain.on('get:students_selection',(e,data)=>{
    students_controller.get_selections(index_screen,data);
  });
  ipcMain.on('update:selections',(e,data)=>{
    students_controller.update_selections(index_screen,data);
  });
  ipcMain.on('get:subject_selections_count',(e,data)=>{
    students_controller.get_subj_statistics(index_screen,data);
  });
  ipcMain.on('search:selections',(e,data)=>{
    students_controller.search_selection(index_screen,data);
  });
  
  ipcMain.on('print:class_list',(e,data)=>{
  
   table_printing.print_table('class_list',data,'portrait',index_screen)
  });

  ipcMain.on('print:term_results',(e,data)=>{

   table_printing.print_table('term_perfomance',data,'landscape',index_screen)
  });

  ipcMain.on('pick:students_file',(e,data)=>{
    read_excells.open_excells(data=>students_controller.upload_from_excell(data,index_screen),index_screen);
  });

  ipcMain.on('open:students_sample',(e,data)=>{
    index_screen.webContents.send('show:loading','Opening');
   shell.openItem(__dirname+'/assets/excell_samples/students.xlsx')
   setTimeout(()=>{
    index_screen.webContents.send('close:loading');
    shell.openItem(__dirname+'/assets/excell_samples/students.xlsx')
   },3000)
  });
//teachers

  ipcMain.on('get:teachers',(e,data)=>{
    teachers_controller.get_teachers(index_screen,data);
  });

  ipcMain.on('save:teacher',(e,data)=>{
    teachers_controller.save_teacher(index_screen,data);
  });

  ipcMain.on('delete:teacher',(e,data)=>{
    teachers_controller.delete_teacher(index_screen,data);
  });
  ipcMain.on('get:update_teacher_details',(e,data)=>{
    teachers_controller.get_update(index_screen,data);
  });
  ipcMain.on('update:teacher',(e,data)=>{
    teachers_controller.update_teacher(index_screen,data);
  });

  ipcMain.on('get:some_teachers',(e,data)=>{
    teachers_controller.get_teachers_for(index_screen,data);
  });
  //subjects

  ipcMain.on('get:subject_teacher',(e,data,select_mode)=>{
    teachers_controller.get_subject_teachers(index_screen,data,select_mode);
  });

  ipcMain.on('save:merge',(e,data,select_mode)=>{
    teachers_controller.save_merge(index_screen,data,select_mode);
  });

  ipcMain.on('save:mapping',(e,data)=>{
    teachers_controller.save_mapping(index_screen,data);
  });
  ipcMain.on('remove:teacher_mapping',(e,data)=>{
    teachers_controller.remove_mapping(index_screen,data);
  });
  ipcMain.on('ungroup:class',(e,data)=>{
    teachers_controller.ungroup_class(index_screen,data);
  });
  ipcMain.on('remove_subject',(e,data)=>{
    teachers_controller.remove_subject(index_screen,data);
  });
  ipcMain.on('reset_all',(e,data)=>{
    teachers_controller.reset_all(index_screen,data);
  });
  //timetable

ipcMain.on('console',(e,data)=>{
  console.log(data)
})
ipcMain.on('close:loading',(e,data)=>{
  index_screen.send('close:loading')
  tt_process.close()
  tt_process=null
})
ipcMain.on('set:loading_text',(e,data)=>{
  index_screen.send('set:loading_text',data)
})
  ipcMain.on('get:tt',(e,data)=>{
    timetable_controller.get_tt(index_screen,data);
  }); 
  ipcMain.on('save_tt',(e,data)=>{
    timetable_controller.save_teaching(index_screen,data);
  }); 
ipcMain.on('print:tt',(e,data)=>{
   table_printing.print_table('timetable',data,'landscape',index_screen)
  });
  ipcMain.on('generate:teaching_tt',(e,data)=>{
    open_tt_process()
    timetable_controller.generate_teaching(index_screen,tt_process);
  }); 
  ipcMain.on('generate:onduty',e=>{
    timetable_controller.generate_onduty(index_screen);
  });
  ipcMain.on('gen_exam_tt',(e,exam)=>{
    timetable_controller.generate_exams(index_screen,exam);
  });
  ipcMain.on('get_tt_subjects',(e)=>{
    timetable_controller.get_tt_subjects(index_screen);
  }); 
  ipcMain.on('save_grouping',(e,data)=>{
    teachers_controller.save_grouping(index_screen,data,timetable_controller);
  }); 

  ipcMain.on('ungroup_grouping',(e,data)=>{
    teachers_controller.ungroup_grouping(index_screen,data,timetable_controller);
  }); 
  //enrollment
  ipcMain.on('get:form1',(e)=>{
    enrollment_controller.get_form1(index_screen);
  }); 
  ipcMain.on('save:form1',(e,data)=>{
    enrollment_controller.save_form1(index_screen,data);
  }); 
  ipcMain.on('delete:form1',(e,data)=>{
    enrollment_controller.delete_form1(index_screen,data);
  }); 
  ipcMain.on('commit:form1',(e)=>{
    enrollment_controller.commit(index_screen);
  }); 

  ipcMain.on('pick:form1_file',(e,data)=>{
    read_excells.open_excells(data=>enrollment_controller.upload_from_excell(data,index_screen),index_screen);
  });

  ipcMain.on('open:form1_sample',(e,data)=>{
    index_screen.webContents.send('show:loading','Opening');
   shell.openItem(__dirname+'/assets/excell_samples/form1.xlsx')
   setTimeout(()=>{
    index_screen.webContents.send('close:loading');
    shell.openItem(__dirname+'/assets/excell_samples/form1.xlsx')
   },3000)
  });

  //perfomance

  ipcMain.on('get:all_results',(e,data)=>{
    perfomance_controller.get_results(index_screen,data);
  });

  ipcMain.on('search:student_result',(e,data)=>{
    perfomance_controller.search_results(index_screen,data);
  });
  ipcMain.on('get:term_results',(e,data)=>{
    perfomance_controller.get_term_results(index_screen,data);
  });
  ipcMain.on('search:term_results',(e,data)=>{
    perfomance_controller.search_term_results(index_screen,data);
  });
  ipcMain.on('print:finalized',(e,data)=>{
    console.log(data)
   table_printing.print_table('exam_perfomance',data,'landscape',index_screen)
  });
  //grapging

  ipcMain.on('get:graph1_data',(e,data)=>{
    perfomance_controller.get_graph1_data(index_screen,data);
  });

  ipcMain.on('get:graph2_data',(e,data)=>{
    perfomance_controller.get_graph2_data(index_screen,data);
  });

  //report_remarks

  ipcMain.on('update:remarks',(e,data)=>{
    report_controller.update_remarks(index_screen,data);
  });

  ipcMain.on('get:remarks',(e)=>{
    report_controller.get_remarks(index_screen);
  });

  //report card

  ipcMain.on('generate:reports',(e,data)=>{
    report_controller.generate_report(index_screen,data);
  });

  ipcMain.on('pick:balance_file',(e,data)=>{
    read_excells.open_excells(data=>report_controller.upload_from_excell(data,index_screen),index_screen);
  });

  ipcMain.on('open:balance_sample',(e,data)=>{
    index_screen.webContents.send('show:loading','Opening');
   shell.openItem(__dirname+'/assets/excell_samples/balances.xlsx')
   setTimeout(()=>{
    index_screen.webContents.send('close:loading');
    shell.openItem(__dirname+'/assets/excell_samples/balances.xlsx')
   },3000)
  });

  ipcMain.on('open:folder',(e,path)=>{
    console.log(path)
    shell.showItemInFolder(path)
    shell.beep
  })

  //report preview


  ipcMain.on('view_report',(e,data)=>{
    report_controller.view_report(index_screen,data);
  });
  
  ipcMain.on('print_this',(e,data)=>{
    report_controller.print_this(index_screen,data);
  });