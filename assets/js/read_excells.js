const {dialog}=require('electron')
const x_read=require('read-excel-file/node')

exports.open_excells=(callback,index_screen)=>{
    const options={
        type:'question',
        title:'Upload file',
        message:'Reading file complete. Proceed with upload?',
        buttons:['Continue','Cancel']
    }
    props={properties:['openFile'],filters:[
        {name:'Excell',extensions:['xlsx','frank']}
    ]}
   dialog.showOpenDialog(props).then((res)=>{
       if(!res.canceled){
           x_read(res.filePaths[0]).then((rows)=>{
            dialog.showMessageBox(null,options).then(response=>{
                if(response.response==0){
                    index_screen.webContents.send('show:loading','Uploading');
                    callback(rows)
                }}) 
           })
       }
   })
}