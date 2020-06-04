exports.calc_fitness=(tt,double_slots,no_slots,days)=>{
   let total_error=0;
   let no_days=days.length;
    for( let day=0;day<no_days;day++){
        for( let slot=1;slot<(no_slots+1);slot++){
           let curr_day=days[day]
           let slot_slots=tt.filter(sl=>sl.no==slot && sl.day==curr_day)
            total_error+=teacher_crashes(slot_slots)
        }
    }
 
    return total_error;  



function teacher_crashes(slots){
    let teachers=[]
    let sbjs=[]
    let misplaced=0
    let crashes=0
    for( let i=0;i<slots.length;i++){
     
        if(slots[i]){
            if(slots[i].shared==1){
            if(sbjs.indexOf(slots[i].subject+slots[i].form+slots[i].strm)<0){
               let tcr=slots[i].teachers.split(',')
                teachers=teachers.concat(tcr)
                for( let j=0;j<slots[i].classes.length;j++){
                    sbjs.push(slots[i].subject+slots[i].form+slots[i].classes[j])
                }
            }
            }else{
               let tcr=slots[i].teachers.split(',')
               teachers=teachers.concat(tcr)
            }
    }

    if(slots[i].shared==1){
        for( let j=0;j<slots[i].classes.length;j++){
           let slot2=get_slot(slots[i].classes[j],slots[i].form,slots)
            if(slot2== undefined || slots[i].subject!=slot2.subject){
                misplaced+=2
            }
        }

    }
}
    for( let i=0;i<teachers.length;i++){
        for( let j=(i+1);j<teachers.length;j++){
            if(teachers[i]==teachers[j]){
                crashes++
            }
        }
    }
    
    return crashes+misplaced
}


// function double_positions(double_slots,slots,days,no_slots){

//    let misplaced=0
//     for( let i=0;i<slots.length;i++){
//         if(slots[i].double==1){
//             day_idx=days.indexOf(slots[i].day)
//             absolute_position=(no_slots*day_idx)+slots[i].no
            
//             if(double_slots.indexOf(absolute_position)<0){
//                 misplaced+=2
//             }
//         }
//     }

// return misplaced

// }




function get_slot(cls,form,slots){
    for( let sl=0;sl<slots.length;sl++){
        if( cls==slots[sl].strm  && form==slots[sl].form){
            return slots[sl]
        }
    }
  
}}