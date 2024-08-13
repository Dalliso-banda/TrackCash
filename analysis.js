window.onload=()=>{
let req=window.indexedDB.open('TB',1);           
           req.onerror=error=>{
               throw new Error(`the error ${error} was received `)
           }
                      req.onupgradeneeded=event=>{
               console.log(`updatint ${event.target.result}`);               
let db=event.target.result;              
let objecetStore=db.createObjectStore('userEx',{keypath:'id',autoIncrement:true});
           }
        req.onsuccess=event=>{
              const db= event.target.result; 
             let transaction= db.transaction('userEx','readwrite');
              let store=transaction.objectStore('userEx');
         let getdata= store.getAll();
           
          getdata.onsuccess=  event=>{
             let results= event.target.result;
             console.log('obtained....')
            let userData= 
         results.map((result)=>{
             return result
         });            
       const totalAmounts={}
         userData.forEach((data)=>{
            
        data.forEach((info)=>{   
           
      const catalog = info.expenseName;
     const amount=  info.Amount;                         if(!totalAmounts[catalog]) {
      totalAmounts[catalog]=0;                                     
           }
            totalAmounts[catalog]+=parseFloat(amount.trim());             
               
        })                                          
         })
      let scaleArr=[totalAmounts.Transport,totalAmounts.Beverages,totalAmounts.miscellaneous,totalAmounts.Home,totalAmounts.snacks,totalAmounts.phone]       
      let verboseSpeech = document.getElementById('wordSpill');
      let sum= 0
  
       for(let i=0; i<scaleArr.length; i++){
        
            sum+=scaleArr[i];               
    }        
     let date= new Date();
     let day=date.getDay()+1;
     let month =date.getMonth()+1;
     let year= date.getFullYear();        
      verboseSpeech.innerHTML=`As at ${day}/${month}/${year} you've spent a total of K${sum} accumulatively`
            console.log(JSON.stringify(totalAmounts))                                      
  let chartArrA=  userData.flatMap((exp)=>{
      let arrMaker = exp.map((expense)=>{
              let label =expense.expenseName;
              return label              
             }  )
         return arrMaker
            
        })                
      let chartLabel=[]
      for(let i=0; i<chartArrA.length; i++){     
            if(chartLabel.includes(chartArrA[i].toString())){
             continue; 
              
          }
          else{              
              chartLabel.push(chartArrA[i].toString())                            
          }
          }            
        const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabel,
      datasets: [{
        label: '#you spent in kwacha',
        data: scaleArr,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });               
             }
             }                                                                    
             }
          
       