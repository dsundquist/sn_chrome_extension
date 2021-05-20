// Dean Sundquist
// Service Now Chrome Extension 
// www.deansundquist.com


// Global variables and set event listeners for Message Resizer
var button = document.getElementById('toggleButton');
var checkboxFixComment = document.getElementById('checkbox');
var checkboxFixWhiteSpace = document.getElementById('checkbox2');
var checkboxAddResolution = document.getElementById('checkbox3');
var inputbox = document.getElementById('inputSize');
button.addEventListener('click', setToggle);
checkboxFixComment.addEventListener('click',setToggle);
checkboxFixWhiteSpace.addEventListener('click', setFixWhiteSpace);
checkboxAddResolution.addEventListener('click', setResolutionNotes);

// Code copied from stackoverflow to make the enter key work as one would expect, for resizing boxes 
inputbox.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("toggleButton").click();
  }
});


// Variables for stop watch
var timer = document.getElementById("timer");
var startButton = document.getElementById('startButton');
var stopButton = document.getElementById('stopButton');
var resetButton = document.getElementById('resetButton');

var myWatch = new Stopwatch(timer);

startButton.addEventListener('click', function() {
  //send to background script
  var msg = {
    header: "startWatch",
  }
  chrome.runtime.sendMessage(msg, function(response) {
    console.log(response.header);
  });
  myWatch.start();
});

stopButton.addEventListener('click', function() {
  var msg = {
    header: "stopWatch",
  }
  chrome.runtime.sendMessage(msg, function(response) {
    console.log(response.header);
  });
  myWatch.stop();
});

resetButton.addEventListener('click', function() {
  var msg = {
    header: "resetWatch",
  }
  chrome.runtime.sendMessage(msg, function(response) {
    console.log(response.header);
  });
  myWatch.reset();
});


// Variables for adding text to textboxes 
var contactAttemptButton = document.getElementById("updateContactAttempt");
contactAttemptButton.addEventListener('click', updateContactAttempt);

var newTicketButton = document.getElementById("updateNewTicket");
newTicketButton.addEventListener('click', updateNewTicket);

var newSignature = document.getElementById("updateSignature");
newSignature.addEventListener('click', updateSignature);

var newEscalation = document.getElementById("updateEscalation");
newEscalation.addEventListener('click', updateEscalation);



// When popup.html / .js loads we enter existance as a new page and script
// We need to get all the current variables from background.js
window.onload = function(){
  console.log("Initializing values:");

  // Lets do some timer things
  document.getElementById("timer").innerHTML = "00 : 00";
  
  //Initializing the clock
  chrome.runtime.sendMessage({header: "getWatch"}, function(response) {
    console.log("My getWatch Response is: " + response.isOn + " " + response.timer);
    myWatch.setTime(response.timer);
    myWatch.updateText();
    if(response.isOn){
        myWatch.start();
    }

  });


  //following is only going to be while live
  chrome.runtime.sendMessage({header: "init"}, function(response) {
    console.log("Got initial response: ");
    console.log(response);
    if(response.header == "successful" ) {
      if(response.enabled == true){
        document.getElementById("checkbox").checked = true;
        document.getElementById("title").innerHTML = "Enabled";
      } else if(response.enabled == false) {
        document.getElementById("checkbox").checked = false;
        document.getElementById("title").innerHTML = "Disabled";
      } 
      document.getElementById("inputSize").value = response.maxHeight;
      if(response.fixWhiteSpace == true){
        document.getElementById("checkbox2").checked = true;
        document.getElementById("title2").innerHTML = "Enabled";
      } else if(response.fixWhiteSpace == false) {
        document.getElementById("checkbox2").checked = false;
        document.getElementById("title2").innerHTML = "Disabled";
      } 
      if(response.resolutionnotes == true){
        document.getElementById("checkbox3").checked = true;
        document.getElementById("title3").innerHTML = "Enabled";
      } else if(response.fixWhiteSpace == false) {
        document.getElementById("checkbox3").checked = false;
        document.getElementById("title3").innerHTML = "Disabled";
      } 
    } else {
      console.log("Didn't get a successful response..");
    }
  }); 

}

// Set TextArea Function, I suppose I don't need the bg script for this we can send it to the current tab
function updateContactAttempt(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {header: "setCallText"}, function(response) {
      console.log(response.header);
    });
  });
}

// Set TextArea Function, I suppose I don't need the bg script for this we can send it to the current tab
function updateNewTicket(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {header: "setNewTicketText"}, function(response) {
      console.log(response.header);
    });
  });
}

function updateSignature(){

  //console.log("Calling updateSignature");

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {header: "setSignature"}, function(response) {
      console.log(response.header);
    });
  });
}


function updateEscalation(){

  console.log("Calling updateEscalation");

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {header: "setEscalation"}, function(response) {
      console.log(response.header);
    });
  });
}


//The toggle switch changed states, someone pressed the resize button, or the pressed enter.  Those listeners lead here
function setToggle(){
  
  //Get values, the ~~ forces the inputSize to be a number
  var toggleState = document.getElementById("checkbox").checked;
  var inputSize = ~~document.getElementById("inputSize").value;

  //Update our title text
  if(toggleState){
    document.getElementById("title").innerHTML = "Enabled";
  } else {
    document.getElementById("title").innerHTML = "Disabled";
  }

  //Make sure that the input is a number, this is useless because ~~ above
  if(isNaN(inputSize)){
    alert("Input Size is NaN");
    return;
  }
  
  //Create our message and send it 
  var msg = {
    header: "",
    maxHeight: inputSize,
    enabled: toggleState
  }

  chrome.runtime.sendMessage(msg, function(response) {
    if(response.header == "successful" ){
      console.log("Message successfully sent and got a response");
      console.log(response);
    } else {
      console.log("Didn't get a successful response");
    }
  });

}

function setFixWhiteSpace(){
  var toggleState = document.getElementById("checkbox2").checked;

  if(toggleState){
    document.getElementById("title2").innerHTML = "Enabled";
  } else {
    document.getElementById("title2").innerHTML = "Disabled";
  }

  var msg = {
    header: "fixWhiteSpace",
    fixWhiteSpace: toggleState
  }

  chrome.runtime.sendMessage(msg, function(response) {
    if(response.header == "successful" ){
      console.log("Message successfully sent and got a response");
      console.log(response);
    } else {
      console.log("Didn't get a successful response");
    }
  });

}

// Send an update to the background script on resolutionnotes boolean 
function setResolutionNotes(){
  var toggleState = document.getElementById("checkbox3").checked;

  if(toggleState){
    document.getElementById("title3").innerHTML = "Enabled";
  } else {
    document.getElementById("title3").innerHTML = "Disabled";
  }

  var msg = {
    header: "setResolutionNotes",
    resolutionnotes: toggleState
  }

  chrome.runtime.sendMessage(msg, function(response) {
    if(response.header == "successful" ){
      console.log("Message successfully sent and got a response");
      console.log(response);
    } else {
      console.log("Didn't get a successful response");
    }
  });

}