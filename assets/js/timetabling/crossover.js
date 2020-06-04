// const {ipcRenderer}=require('electron')
exports.cross=(mother,father,data)=>{
    let son=[]
    let daughter=[]
    for( let i=0;i<data.all_streams.length;i++){
        let stream=data.all_streams[i].name
        for( let j=1;j<5;j++){
           let form='form-'+j;
           let A=mother.filter(t=>t.strm==stream && t.form==form)
           let B=father.filter(t=>t.strm==stream && t.form==form)

           let random=Math.floor(Math.random()*2)
            if(random==1){
                son=son.concat(A)
                daughter=daughter.concat(B)
            }else{
                son=son.concat(B)
                daughter=daughter.concat(A)
            }

        }
    }
    return [son,daughter]
}
exports.show=(data)=>{
    console.log(data)
}