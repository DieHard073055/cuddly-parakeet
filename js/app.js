
/**
* @file           app.js
* @author         Eshan Shafeeq
* @description    -The following code will be doing a get request
                  to http://qrng.anu.edu.au/API/api-demo.php to obtain
                  quantum random numbers periodically (5 secs).

                  -These quantum random numbers (mean of all random numbers)
                  will be displayed on svg rectangles.

                  -The rectangles will increase its height in 10px when a
                  new random number has been obtained. (velocityjs)

                  -A horizontal slider has been placed on the page to configure
                  the number of rectangles to be generated on the page.
*/

//URL for the ANS quantum random number generator website
const URL_QRNG = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint16";

window.onload = function(){

  /**
  * @function       addSVG()
  * @description    function to create an SVG rectangle with the text and color.
  *                 color is randomly selected.
  * @return         returns the created SVG object.
  */

  function addSVG( value ){

    //Get the color for the rectangle
    var color_value = Math.floor(Math.random() * 16777216).toString(16);
    var color = '#000000'.slice(0, -color_value.length) + color_value;

    //create the svg
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xlink','http://www.w3.org/1999/xlink');
    svg.setAttribute('width','140');
    svg.setAttribute('height','110');
    svg.setAttribute('style','margin:10px');

    //create the rectangle for the svg
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width','140');
    rect.setAttribute('height','100');
    rect.setAttribute('fill', color);
    rect.setAttribute('rx','7');

    //create the text for the svg
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '65');
    text.setAttribute('y', '55');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('alignment-baseline', 'center');
    text.setAttribute('stroke','#000');
    text.setAttribute('stroke-width','1');
    text.setAttribute('font-size','24');
    text.setAttribute('fill', "#fff");
    //set the default text to loading
    text.textContent = "loading..";

    //add the rectangle and the text to the svg
    svg.appendChild(rect);
    svg.appendChild(text);

    return svg;
  }

  /**
  * @function     update
  * @description  The update function will have multiple asynchronous calls to
  *               the QRNG api, and update the array of svgs with the new mean.
  *               This function will also trigger the animations for velocityjs.
  */

  function update(){
    //an array to manage all the asynchronous calls to the api
    var xhttp_arr = [];

    //We do not want to request while waiting for results
    if( timer != null ) clearTimeout(timer);

    arr_svg.forEach( function(e, i){

      xhttp_arr.push(new XMLHttpRequest());
      xhttp_arr[i].onreadystatechange = function() {

        //if the request was successfull
        if (this.readyState == 4 && this.status == 200) {
          //obtain the quantum random number
          var current_value = Number(JSON.parse(this.responseText).data);
          //starting animation
          $(e.svg.childNodes[0]).delay(100).velocity({height:110});

          //calculate the mean and update the text on the rectangle
          if( e.mean == -1 ){
            e.mean=current_value;
            e.svg.childNodes[1].textContent=e.mean;
          }else{
            e.mean = (e.mean + current_value) / 2;
            var sign = current_value > e.mean ? ">" : "<";
            e.svg.childNodes[1].textContent= sign + " " + e.mean.toFixed(2);
          }

          //ending animation
          $(e.svg.childNodes[0]).delay(500).velocity({height:100});

          //debug statement to indicate the successfull response from the request
          console.log("request recieved for element "
                      + i + " with value "
                      + (JSON.parse(this.responseText).data));

          //restart the timer if all the requests have been successfull
          all_done++;
          if( all_done == num_svg){
            timer = setInterval(update, 5000);
            all_done=0;
          }

        }
      }

      //sending request to the api
      xhttp_arr[i].open("GET", URL_QRNG, true);
      xhttp_arr[i].send();

      //debug statement to indicate we have done a request
      console.log("request sent for element : " + i)
    });
  }

  /**
  * @function setup
  * @description    This function will initialize the array of svgs and populate
  *                 it. Afterwards will trigger the update function.
  **/

  function setup(){
    if( timer != null ) clearTimeout(timer);
    for (var i = 0; i < num_svg; i++) {
      //populate the array with the svg and the mean, since we need to store it.
      arr_svg.push({
        "svg":addSVG(i),
        "mean": -1
      });
    }
    //add the svgs to the dom
    arr_svg.forEach( function(e){
      svg_images.appendChild(e.svg);
    });

    update();

  }


  //Global Variables
  var slider = document.getElementById("svg-slider");
  var output = document.getElementById("num-svg");
  var svg_images = document.getElementById("svg-images");

  var timer=null;
  var arr_svg = [];
  var num_svg = slider.value;

  var all_done=0;

  //Set the value for the slider immedietely
  output.innerHTML = slider.value;

  //Function to handle slider input
  slider.oninput = function() {
    //set the value of the slider
    output.innerHTML = this.value;
    num_svg = this.value;

    //remove all the current svgs from the document.
    while(svg_images.hasChildNodes()){
      svg_images.removeChild(svg_images.lastChild);
      arr_svg.pop();
    }
    //since the number of svgs has been changed, we will re-initiate the program.
    setup();
  }

  //Initiate the program
  setup();
}
