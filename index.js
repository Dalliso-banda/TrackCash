/**/
alert('welcome to track cash version  0.1 prototype')
class formHandler{
    constructor(form,submitBtn,formInput){
        this.form =document.querySelector(form);
       this.submitBtn =document.getElementById(submitBtn);
       this.formInputFields =this.form.querySelectorAll(formInput);       
            this.form.addEventListener('submit',this.processForm.bind(this))
       
    }
   formValidation(event){
     event.preventDefault();
   this.formInputValue= [...this.formInputFields].map((input)=>{
   if(input.value.trim()==''){
       input.value="0"
     
   }
   else{
       input.style.border="2px solid green"
    
     
   }
  return  input
      });
   this.userData= this.formInputValue.map((value)=>{ 
   let inputName= value.name;
   let inputValue= value.value;
   return {expenseName:inputName, Amount:inputValue}                 
        })       
 {  
 console.log(JSON.stringify(this.userData))
  this.req=window.indexedDB.open('TB',1);
           this.req.onerror=error=>{
               throw new Error(`the error ${error} was received `)
           }
           this.req.onupgradeneeded=event=>{
               console.log(`updatint ${event.target.result}`);
               this.db=event.target.result;
               this.objecetStore=this.db. createObjectStore('userEx',{keypath:'id',autoIncrement:true});
           }
        this.req.onsuccess=event=>{
              const db= event.target.result;
              this.transaction= db.transaction('userEx','readwrite');
              this.store=this.transaction.objectStore('userEx');
          this.getdata= this.store.getAll();
          this.getdata.onsuccess=event=>{
              this.result= event.target.result;
             alert(JSON.stringify(this.result)) 
          }
              this.addingInfo=              this.store.add(this.userData);
              this.addingInfo.onerror=error=>{
                  console.log(error)
                                                                                      
              }           
                 this.addingInfo.onsuccess=event=>{
       console.log(`${event} full field successfuly`)
        
              }
             
              
           }
           
              
         }  
        
           
          
   }
    
   
   processForm(event){
   event.preventDefault();
       this.formValidation(event);
       
       
   }
   
}
new formHandler('form','formBtn','input')
