// Todo: Make M+ M- and MC functional
let string = "";
let buttons = document.querySelectorAll('.button');
Array.from(buttons).forEach((button)=>{
  button.addEventListener('click', (e)=>{
    if(e.target.innerHTML == '='){
      string = eval(string);
      document.querySelector('input').value = string;
    }
    else if(e.target.innerHTML == 'C'){
      string = ""
      document.querySelector('input').value = string;
    }else if(e.target.innerHTML.includes("%")){
      string = eval(string);
     
      document.querySelector('input').value = string/100  
    }
    else{ 
      let domValue = e.target.innerHTML
    if( document.querySelector('input').value ){
      string = document.querySelector('input').value 
    }if(e.target.innerHTML.includes("M+")){
      domValue = "+"
    }else if(e.target.innerHTML.includes("M-")){
      domValue = "-"
    }
    string = string + domValue;
    document.querySelector('input').value = string;
      }
  })
})