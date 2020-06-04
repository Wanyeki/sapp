const path=require('path')
const { ipcRenderer } =require("electron");
const Genetic=require('genetic-js')
const {remote} = require('electron');
const seeding=require(path.join(__dirname,'../assets/js/timetabling/seeding'))
const fitness=require(path.join(__dirname,'../assets/js/timetabling/fitness'))
const mutate=require(path.join(__dirname,'../assets/js/timetabling/mutate'))
const crossover=require(path.join(__dirname,'../assets/js/timetabling/crossover'))

const fs=require('fs')

ipcRenderer.on('generate_ttt',(e,all_subjects,all_streams,shared_group)=>{
    ipcRenderer.send('console',all_streams)
        let no_streams=all_streams.length
        let no_classes=no_streams*4
        let no_slots=9
        let double_slots=[1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43]
        let days=['mon','tue','wed','thu','fri']
        let no_days=days.length
        
    let all_data={
        filtered_sbjs:all_subjects,
        no_streams:no_streams,
        no_classes:no_classes,
        no_slots:no_slots,
        double_slots:double_slots,
        days:days,
        no_days:no_days,
        shared_group:shared_group,
        all_streams:all_streams,
        seeding:seeding,
        mutate:mutate,
        fitness:fitness,
        crossover:crossover,
        ipc:ipcRenderer
    }

    
        let genetic=Genetic.create();
    
        genetic.seed=()=>{
            return this.userData.seeding.random_tt(
                this.userData.filtered_sbjs,this.userData.no_streams,this.userData.no_classes,this.userData.no_slots,
                this.userData.double_slots,this.userData.days,this.userData.no_days,this.userData.shared_group,this.userData.all_streams)
        }
    
        genetic.mutate=(tt)=>{
            return this.userData.mutate.mutate_tt(tt,this.userData.all_streams,this.userData.double_slots,this.userData.no_slots,this.userData.days)
        }
        genetic.crossover=(m,f)=>{
            return this.userData.crossover.cross(m,f,this.userData)
        }
    
        genetic.select1=Genetic.Select1.Fittest
        genetic.select2=Genetic.Select2.FittestRandom
        genetic.optimize=Genetic.Optimize.Minimize
        genetic.generation=(pop, generation, stats)=>{
        console.log(pop[0].fitness)
         return pop[0].fitness!=0
        }
        genetic.fitness=(tt)=>{
            return this.userData.fitness.calc_fitness(tt,this.userData.double_slots,this.userData.no_slots,this.userData.days)
        }
    
        var config={
            "iterations":1000,
            "size":250,
            "mutation":0.4,
            "skip":20,
            "crossover":0.2
        }
        genetic.notification = function(pop, generation, stats, isFinished) {
            if(isFinished){
               
                ipcRenderer.send('console','finished')
                ipcRenderer.send('close:loading')
    
                ipcRenderer.send('save_tt',pop[0].entity)
            }
           ipcRenderer.send('set:loading_text','generation:'+generation+'<br> errors: <span style="color:red;font-weight:bold">'+pop[0].fitness+'</span>')
        }
        
    
    genetic.evolve(config,all_data)
    
    // y=seeding.random_tt(filtered_sbjs,no_streams,no_classes,no_slots,double_slots,days,no_days,shared_group,all_streams)
    
    //     y=JSON.stringify(y)
    //     y=y.replace(/},/g,'},\n')
    
    //  fs.writeFileSync(__dirname+'/tt.json',y)
     //data=require('./test.json')
       
    //  console.log(fitness.calc_fitness(data,double_slots,no_slots,days))
    // console.table(data)
    // data=mutate.mutate_tt(data,all_streams,double_slots,no_slots,days)
    // console.table(data)
    // save_tt(data)
})

