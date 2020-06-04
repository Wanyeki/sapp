exports.mutate_tt=(tt,all_streams,double_positions,no_slots,days)=>{
    let swaps=1
    for( let i=0;i<all_streams.length;i++){
       let stream=all_streams[i].name
        for( let j=1;j<5;j++){
            let form='form-'+j;
            let slots=tt.filter(t=>t.strm==stream && t.form==form)
            if(slots.length>0){
                let random=Math.floor(Math.random()*2.5)
                if(random==1){
                for( let sw=0;sw<swaps;sw++){
                   let random_index1=[Math.floor(Math.random()*(slots.length-1)),Math.floor(Math.random()*(slots.length-1))]
                    slots= swap_slots(random_index1,slots,double_positions,no_slots,days)
                }
            }
            }
        }
    }
    return tt

    function swap_slots(idxs,slots,double_positions,no_slots,days){
        // console.table(slots)
        
        let slot_a=slots[idxs[0]]
        let slot_b=slots[idxs[1]]

        if(slot_a.double!=slot_b.double){
           let other_slot=double_positions[ Math.floor(Math.random()*(double_positions.length-1))]
            let no=other_slot % no_slots
           let day=days[Math.floor(other_slot/no_slots)]
           let with_d;
           let without_d
            if(slot_b.double==1){
                // console.log('slot b has double')
               with_d=slot_b;
               without_d=find_slot(slots,no,day)
           
            }else{
               
                with_d=slot_a;
                without_d=find_slot(slots,no,day)
                
               
            }
            if(without_d){
            if(without_d.double==1){
               let temp={}
                temp.no=with_d.no
                temp.day=with_d.day
    
                with_d.no=without_d.no;
                with_d.day=without_d.day
    
                without_d.no=temp.no;
                without_d.day=temp.day;
            }else{
                let next_b=find_slot(slots,without_d.no+1,without_d.day)
                if(next_b==undefined){
                    console.table(slots)
                    console.log(without_d.no+1+'..'+without_d.day)
                }
                    if(next_b.double==1){
                        let temp={}
                        temp.no=with_d.no
                        temp.day=with_d.day
            
                        with_d.no=next_b.no;
                        with_d.day=next_b.day
            
                        next_b.no=temp.no;
                        next_b.day=temp.day;
                    }else{
                    
                       let temp={}
                        temp.no=with_d.no
                        temp.day=with_d.day

                        with_d.no=without_d.no;
                        with_d.day=without_d.day;

                        without_d.no=temp.no
                        without_d.day=temp.day

                        next_b.no=temp.no+1
                        next_b.day=temp.day
                    }
        
        } 
        }else{
          let  prev_b=find_slot(slots,no-1,day)
               
                   let temp={}
                    temp.no=with_d.no
                    temp.day=with_d.day
        
                    with_d.no=prev_b.no;
                    with_d.day=prev_b.day
        
                    prev_b.no=temp.no;
                    prev_b.day=temp.day;
        }

        }else if(slot_a.double==slot_b.double){
            let temp={}
            temp.no=slot_a.no
            temp.day=slot_a.day

            slot_a.no=slot_b.no;
            slot_a.day=slot_b.day

            slot_b.no=temp.no;
            slot_b.day=temp.day;

        }

        return slots
    
}


function find_slot(slots,no,day){
    // console.log(no+day+'...')
    for( let n=0;n<slots.length;n++){
        if(slots[n].no==no && slots[n].day==day){
            return slots[n]
        }
    }
   
    return null;
}}