
exports.random_tt=(filtered_sbjs,no_streams,no_classes,no_slots,double_slots,days,no_days,shared_group,all_streams)=>{
    class Slot{
        constructor(no,day,strm,form){
            this.no=no;
            this.day=day;
            this.strm=strm;
            this.form=form
              
          }
        no=null;
        day=null;
        strm=null;
        form=null;
        subject=null;
        teachers=null;
        double=0;
        shared=0
        classes=null
   set_subject(subject,teachers,double,shared){
          this.shared=shared;
          this.double=double;
          this.teachers=teachers;
          this.subject=subject;
   }
   set_shared(classes){
          this.classes=classes
   }
  
    }
       let rdm_tt=[]
        
        for( let frm=1;frm<5;frm++){
            let used_slots=[]
            let cross_overs={doubles:[],others:[]}
            let used_d_slots=[]
            for( let cls=0;cls<no_streams;cls++){

                let the_subjects=filtered_sbjs.filter(
                    su=>su.form=='form-'+frm && (su.class==all_streams[cls].name || su.class=='group' || su.class=='all' )
                    )

                let multiplied=multiply_sbjs(the_subjects)
                let with_double=multiplied[1]
                 with_double=filter_doubles(with_double,cross_overs.doubles,cls)
               
                multiplied=multiplied[0]   
                
                // console.table(multiplied)    
                let double_positions=get_double_pos(with_double.length)
                 for( let pos=0;pos<double_positions.length;pos++){
                     while(used_d_slots.indexOf(''+frm+cls+double_positions[pos])>-1){
                        double_positions[pos]=get_double_pos(1);
                        
                     }
                        let rounds=Math.floor(double_positions[pos]/no_slots)
                        let remainder=double_positions[pos] % no_slots
                         
                         let new_slot=new Slot(remainder,days[rounds],all_streams[cls].name,'form-'+frm)
                         let d_subject=with_double[pos]
                         new_slot.set_subject(d_subject.subject,d_subject.title,d_subject.has_double,d_subject.class=='group'?1:0)
                         let next_slot=remainder+1
                         used_slots.push(''+frm+cls+rounds+remainder)
                         used_slots.push(''+frm+cls+rounds+next_slot)
                         used_d_slots.push(''+frm+cls+double_positions[pos])
                        
                         rdm_tt.push(new_slot)
                         if(new_slot.shared==1 ){
                            let spl=d_subject.subjects.split(',')[0].split(' ')
                            let shared_sbjs=d_subject.subjects.split(',')
                             if(spl.length==4){
                                 spl.shift()
                             }
                            let is_group_of_shared=spl.length==2
                             if(is_group_of_shared){
                                let temp=[]
                                for( let sbj=0;sbj<shared_sbjs.length;sbj++){
                                    temp=temp.concat(get_real_classes(shared_sbjs[sbj]))
                                }
                              
                                shared_sbjs=remove_duplcate(temp)
                             }
                               let s_classes=shared_sbjs.map(s=>{
                                    let stm=s.split(' ')
                                    stm.shift()
                                    stm=stm[2] 
                                    return stm
                                })
                                new_slot.set_shared(s_classes)
                                for( let sbj=0;sbj<shared_sbjs.length;sbj++){
                                    let stm=shared_sbjs[sbj].split(' ')
                                    stm.shift()
                                    stm=stm[2]
                                    // console.log(shared_sbjs[sbj])
                                   let stream_index=index_of_stream(stm)
                                    if(stream_index!=cls){
                                        let new_slot=new Slot(remainder,days[rounds],stm,'form-'+frm)
                                        new_slot.set_subject(d_subject.subject,d_subject.title,d_subject.has_double,d_subject.class=='group'?1:0)
                                        new_slot.set_shared(s_classes)

                                        let next_slot=remainder+1
                                        rdm_tt.push(new_slot)
                                        cross_overs.doubles.push([stream_index,d_subject])
                                        used_slots.push(''+frm+stream_index+rounds+remainder)
                                        used_slots.push(''+frm+stream_index+rounds+next_slot)
                                        used_d_slots.push(''+frm+stream_index+double_positions[pos])
                                        
                                    }

                                }
                             

                         }
                         
                     
                 }

                for( let day=0;day<no_days;day++){
                    for( let slt=1;slt<(no_slots+1);slt++){
                        if(used_slots.indexOf(''+frm+cls+day+slt)<0){
                        let new_slot=new Slot(slt,days[day],all_streams[cls].name,'form-'+frm)
                       
                        multiplied=filter_doubles(multiplied,cross_overs.others)
                        if(multiplied.length<1){
                            break
                        }
                       let sb_index=Math.floor(Math.random()*multiplied.length)
                        let rd_sub=multiplied[sb_index]
                        if(rd_sub==undefined){
                            console.log('..............')
                            console.log(sb_index)
                            console.log('..............')
                        }
                        new_slot.set_subject(rd_sub.subject,rd_sub.title,rd_sub.has_double,rd_sub.class=='group'?1:0)
                        multiplied=remove_sbj(multiplied,rd_sub.subject)

                        if(new_slot.shared==1 ){
                           let spl=rd_sub.subjects.split(',')[0].split(' ')
                           let shared_sbjs=rd_sub.subjects.split(',')
                            if(spl.length==4){
                                spl.shift()
                            }
                            let is_group_of_shared=spl.length==2
                            if(is_group_of_shared){
                                let temp=[]
                               for( let sbj=0;sbj<shared_sbjs.length;sbj++){
                                   temp=temp.concat(get_real_classes(shared_sbjs[sbj]))
                               }
                             
                               shared_sbjs=remove_duplcate(temp)
                            }
                              let s_classes=shared_sbjs.map(s=>{
                                   let stm=s.split(' ')
                                   stm.shift()
                                   stm=stm[2] 
                                   return stm
                               })

                               new_slot.set_shared(s_classes)
                            }

                        rdm_tt.push(new_slot)
                        used_slots.push(''+frm+cls+day+slt)

                        
                        }
                    }
                }
            }
        }
        
    return rdm_tt;
   

    function multiply_sbjs(sbjs){

       let without_double=sbjs.filter(sb=>sb.has_double==0)
       let with_double=sbjs.filter(sb=>sb.has_double==1)
    
        let output=[]
        let multiplier=Math.floor( (no_slots*no_days)/sbjs.length)
        let remainder=(no_slots*no_days) % sbjs.length
        for( let i=0;i<multiplier;i++){
            output=output.concat(without_double)    
        }
    
    
        for( let i=0;i<with_double.length;i++){
            let wd={}
            wd.subject=with_double[i].subject
            wd.form=with_double[i].form
            wd.class=with_double[i].class
            wd.has_double=0
            wd.title=with_double[i].title
            wd.subjects=with_double[i].subjects
            for( let j=0;j<(multiplier-1);j++){
                output.push(wd)
            }
        }
        let k=1
        for( let i=0;i<sbjs.length;i++){ 
            if(k>(remainder-with_double.length)){break}
            if(sbjs[i].has_double==0){
               
                output.push(sbjs[i])
                k++
            }
        }
    
    
    return [output,with_double]
    
    }
        function get_double_pos(slots){
           let db_pos=[];
            for( let i=0;i<slots;i++){
                db_pos.push(double_slots[Math.floor(Math.random()*(double_slots.length-1))])
            }
           
           let no_similar=true;
            for( let i=0;i<slots;i++){
                for( let j=i+1;j<slots;j++){
                    if(db_pos[i]==db_pos[j]){
                        no_similar=false
                    }
                }
            }
    
            if(no_similar){
                return db_pos
            }else{
                return get_double_pos(slots)
            }
            
        }
        function index_of_stream(name){
            for( let i=0;i<all_streams.length;i++){
                if(all_streams[i].name==name){
                    return i
                }
            }
           console.log('no stream')
           console.log(name)
        }

      function get_real_classes(sb){
         let spltd=sb.split(' ')
     
          for( let i=0;i<shared_group.length;i++){
            if(shared_group[i].form==spltd[1] && shared_group[i].subject == spltd[0]){
                return shared_group[i].subjects.split(',')
            }
          }
      }
      function remove_duplcate(sbs){
         let classes=[]
         let no_duplicates=[]
          for( let i=0;i<sbs.length;i++){
            let spltd=sbs[i].split(' ')
             spltd.shift()
            if(classes.indexOf(spltd[2])<0){
                classes.push(spltd[2])
                no_duplicates.push(sbs[i])
            }
          }
          return no_duplicates
      }
      function filter_doubles(doubls,crosses,cls){
          if(crosses.length>0){
         let real_doubles=doubls.filter(db=>{
            let  not_exist=true
             for( let i=0;i<crosses.length;i++){
               if(crosses[i][1].subject==db.subject && crosses[i][1].class==db.class && cls==crosses[i][0]){
                   not_exist=false
               }
             }
             return not_exist
          })
          return real_doubles
        }else{
            return doubls;
        }
    
      }
    
      function remove_sbj(sbjs,subject){
        for( let i=0;i<sbjs.length;i++){
            if(sbjs[i].subject==subject){
                sbjs.splice(i,1)
                  break
            }
        }
    
        return sbjs
    }}


   