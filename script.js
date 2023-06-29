let inputString = "";
let buttons = document.querySelectorAll('.button');
Array.from(buttons).forEach((button)=>{
  button.addEventListener('click', (e)=>{
    if(e.target.innerHTML == '='){
      inputString = eval(inputString);
      document.querySelector('input').value = inputString;
    }
    else if(e.target.innerHTML == 'C'){
      inputString = ""
      document.querySelector('input').value = inputString;
    }else if(e.target.innerHTML.includes("%")){
      inputString = eval(inputString);
     
      document.querySelector('input').value = inputString/100  
    }
    else{ 
      let domValue = e.target.innerHTML
    if( document.querySelector('input').value ){
      inputString = document.querySelector('input').value 
    }if(e.target.innerHTML.includes("M+")){
      domValue = "+"
    }else if(e.target.innerHTML.includes("M-")){
      domValue = "-"
    }
    inputString = inputString + domValue;
    document.querySelector('input').value = inputString;
      }
  })
})