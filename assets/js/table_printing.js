const  ptp=require('pdf-to-printer')
const handlebars=require('handlebars')
const pdf=require('html-pdf')
const fs =require('fs')
const os=require('os')


exports.print_table=(template,data,orientation,index_screen)=>{
    let options={
        format:"A4",
        orientation:orientation,
        border:"5mm"
        
    };
    date=new Date()
    html=fs.readFileSync(__dirname+'/print_templates/'+template+'.html','utf8')
   tt= data[0]?data[0].title:data.title
   if(data[0] && data[0].title){
    //    console.log('aiiiiiiiiiiiiiii')
       delete data[0].title;
   }
   html2= handlebars.compile(html)({
       data:data,
       title:tt

   })
    // fs.writeFileSync(__dirname+'/test.html',html2)
   pdf.create(html2,options).toFile(os.tmpdir()+'/schoolapp/wanyeki/'+template+date.getMinutes()+'.pdf',(err,res)=>{
    if(err) return console.log(err);
    ptp.print(res.filename).then(
        index_screen.webContents.send('close:loading')
    ).catch(
        index_screen.webContents.send('alert:message',{type:'f-danger',message:'No default printer'})
        
    )
    
});


}