"use strict";

(function(){
  console.log("Ready, set, go!");

window.session_token = decodeURIComponent(document.cookie.split('session_token=').pop().split(';').shift());

const socket = io.connect(`/?session_token=${window.session_token}`);
window.socket = socket;


const main = () => {

const generate_color = () => "#"+((1<<24)*Math.random()|0).toString(16)

var current_color = user.color || generate_color(); 

user.color = current_color;

socket.emit('user.save', user);

var canvas1 = document.getElementById("drawHere1");

canvas1.width = 512; 
canvas1.height = 480;

canvas1.addEventListener("keydown", followKeyDown, false);

canvas1.focus();


var context1 = drawHere1.getContext('2d');
context1.translate(256, 240);
context1.fillStyle = current_color;
context1.fillRect(0, 0, 0, 0);
context1.globalCompositeOperation = "overlay";


var canvas2 = document.getElementById("drawHere2");

canvas2.width = 512; 
canvas2.height = 480;

canvas2.addEventListener("keydown", mirrorKeyDown, true);

var context2 = drawHere2.getContext('2d');
context2.translate(256, 240);
context2.fillStyle = current_color;
context2.fillRect(0, 0, 0, 0);
context2.globalCompositeOperation = "overlay";


var x = 0;
var y = 0;
var u = -200;
var w = -10;


const contexts = {
  context1,
  context2
}



const send_movement = (context_name, x, y, color) => {
  socket.emit('move', context_name, x, y, color);
};

const rec_movement = (context_name, x, y, color) => {
  let context = contexts[context_name];

  let original_fill_style = String(context.fillStyle);
  context.fillStyle = color;

  context.fillRect(x, y, 10, 10);

  context.fillStyle = original_fill_style;
};

socket.on('move', rec_movement);

window.rec_movement = rec_movement;

function followKeyDown(e) { 

  e.preventDefault();

  if (x <= -200) {
      context1.save();
      canvas1.blur();
      canvas2.focus();
      mirrorKeyDown();
  }
   
    switch(e.which) {
        
        case 37:

           if (x > -200) {
              canvas1.focus();
              x -= 10;
              context1.fillRect(x, y, 10, 10);
              send_movement('context1', x, y, context1.fillStyle);
            }
            return x;

            break;
        

        case 38:

            if (y <= -230) {
              return false
            }

            else { 
            
              y -= 10;
              context1.fillRect(x, y, 10, 10);
              send_movement('context1', x, y, context1.fillStyle);
            }
          
            return y;
            break;
        
        
        case 39:

            if (x >= 240) {
              return false
            }
            else {
             
              x += 10;
              context1.fillRect(x, y, 10, 10); 
              send_movement('context1', x, y, context1.fillStyle);
            }
            
            return x;
            break;
       

        case 40:

            if (y >= 220) {
              return false
            }
            else {
           
            y += 10;    
            context1.fillRect(x, y, 10, 10); 
            send_movement('context1', x, y, context1.fillStyle);
            }
            return y;
            break;
    } // Switch END  
} // followKeyDown END


function mirrorKeyDown(ev) { 
    
    ev.preventDefault();

    switch(ev.which) {
        
        case 37:

           if (u < -200) {
              context2.save();
              canvas2.blur();
              canvas1.focus();
              x += 10;
              followKeyDown();
            }

            else {
              canvas2.focus();
              context2.fillRect(u, w, 10, 10);
              u -= 10;
              send_movement('context2', u, w, context2.fillStyle);
            }
          
            return u;
            break;
        

        case 38:

            if (w <= -230) {
              return false;
            }
      
            else { 
            
              context2.fillRect(u, w, 10, 10);
              w -= 10;
              send_movement('context2', u, w, context2.fillStyle);
            }
            
          
            return w;
            break;
        
        
        case 39:

            if (u >= 210) {
              return false;
            }

            else {
             
              context2.fillRect(u, w, 10, 10);
              u += 10;
              send_movement('context2', u, w, context2.fillStyle);
            }
            
            return u;
            break;
       

        case 40:

            if (w >= 180) {
              return false;
            }

            else {
            context2.fillRect(u, w, 10, 10);
            w += 10;
            send_movement('context2', u, w, context2.fillStyle);
            }
            return w;
            break;
    } // Switch END    
} // mirrorKeyDown END


socket.emit('replay')
}

socket.emit('user', (user) => {
  window.user = user;


  main();
});


})(); // Ready end