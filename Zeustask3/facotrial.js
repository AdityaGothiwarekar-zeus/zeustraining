let factlarge = [1];

function factorial(number , factlarge){

    let carry = 0;
    for(let i = 0 ; i <factlarge.length ; i++){
        var product = factlarge[i] * number + carry;
        factlarge[i] = product % 10; 
        carry = Math.floor(product / 10);  
    }
    while(carry > 0){
        factlarge.push(carry %10);
        carry = Math.floor(carry/10);
    }
    return factlarge;
}
function multiply(n ){
    
    if(n<0){
        return "invalid input";
    }
    if(n === 0 || n===1){
        return 1;
    }
    else{
        for(var i = 2 ; i<n ;i++){
        factorial(i,factlarge);
    }
    }
    return factlarge.reverse().join('');

}
let n = 2;
console.log(multiply(n));