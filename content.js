// Dean Sundquist
// Service Now Chrome Extension 
// Content JS
// www.deansundquist.com

// Global Variables for content.js, mostly irrelevant as we'll intialize
var enabled = false;
var maxHeight = 0;
var fixWhiteSpace = false;
var resolutionnotes = false;

var callText = "\nCustomer Contact Informed: \n Phone Number/Email Used: \n Time Contacted:  \n Task(s) Performed: \n - Left Voicemail \n Next Step:"
var newTicketText = "\nContact Name: \nContact Phone Number: \nContact Email Address: \n\nSerial Number or Contract Number: \nValidated? (Y/N): \nDevice Make/Model: \nDevice IOS image/Firmware/OS version: \n\nSeverity/Impact of Issue (Number of users affected, locations): \n\nDescription of Issue: \nWhen did it start: \nRecent changes: \nError messages / Indicator lights: \n\nCustomer troubleshooting performed: \n";
var escalationText = "\nSerial Number or Contract Number: \nValidated? (Y/N): \nDevice Make/Model: \nDevice IOS image/Firmware/OS version: \n\nSeverity/Impact of Issue (Number of users affected, locations): \n\nDescription of Issue: \nWhen did it start: \nRecent changes: \nError messages / Indicator lights: \n\nCustomer troubleshooting performed:"
var mySignature = "\nDefault Signature\nNeeds To Be Updated\nSee ./Data/Signature.json"
var savedSignature = "";
// Used for testing
console.log("Content Script Created");


// Send message to background script to get current details 
window.onload = function(){
  console.log("Initializing values:");

  //load signature from file (if it exists)  
  const url = chrome.runtime.getURL('data/signature.json');
  fetch(url)
    .then(response => response.json())
    .then(data => {
      //console.log(data.data);
      savedSignature = data.data;  
    });


  chrome.runtime.sendMessage({header: "init"}, function(response) {  //Send w/ the init status so we don't set any variables
    console.log("Got initial response: ");
    console.log(response);
    if(response.header == "successful" ) {

        // Call Resize w/ our current values, which are 
        enabled = response.enabled;
        maxHeight = response.maxHeight;
        fixWhiteSpace = response.fixWhiteSpace;
        resolutionnotes = response.resolutionnotes;
        if (fixWhiteSpace){
          removeWhiteSpace();
        }
        if(resolutionnotes){
          setResolutionNotes();
        }
        reSize();
        
    } else {
      console.log("Didn't get a successful response..");
    }
  });
}


// got an update message from someone
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
   
  //Set Text
  if(message.header === "setCallText"){
    console.log("Got Set Text Message!");
    sendResponse({header: "successful"});
    var textBoxes = document.getElementById("activity-stream-comments-textarea");
    if(textBoxes == null){  //if that didn't work see if we can get the new ticket comment box 
      textBoxes = document.getElementById("sn_customerservice_case.comments");
    }
    textBoxes.value += callText;
    textBoxes.style.height = "140px";

  } else if (message.header === "setNewTicketText") {
    console.log("Got Set Text Message!");
    sendResponse({header: "successful"});
    // If I'm on a current ticket
    var textBoxes = document.getElementById("sn_customerservice_case.description");
    if(textBoxes == null){  //if that didn't work see if we can get the new ticket comment box 
      textBoxes = document.getElementById("sn_customerservice_case.comments");
    }
    if(textBoxes != null){ //now try one of the above should have worked if we were on a legit page 
      textBoxes.value += newTicketText;
      textBoxes.style.height = "320px";
    }

  } else if (message.header === "setEscalation") {
    console.log("Got Set Text Message!");
    sendResponse({header: "successful"});
    // If I'm on a current ticket
    var textBoxes = document.getElementById("activity-stream-comments-textarea");
    if(textBoxes == null){  //if that didn't work see if we can get the new ticket comment box 
      textBoxes = document.getElementById("sn_customerservice_case.comments");
    }
    if(textBoxes != null){ //now try one of the above should have worked if we were on a legit page 
      textBoxes.value += escalationText;
      textBoxes.style.height = "320px";
    }

  } else if (message.header === "setSignature") {
    console.log("Got Set Text Message!");
    
    sendResponse({header: "successful"});
    // If I'm on a current ticket
    var textBoxes = document.getElementById("activity-stream-comments-textarea");
    if(textBoxes == null){  //if that didn't work see if we can get the new ticket comment box 
      textBoxes = document.getElementById("sn_customerservice_case.comments");
    }
    if(textBoxes != null){ //now try one of the above should have worked if we were on a legit page 
      if (savedSignature != ""){
           mySignature = savedSignature;
      }
      textBoxes.value = textBoxes.value + mySignature;
      var originalHeight = parseInt(textBoxes.style.height,10);
      var newHeight = 150 + originalHeight;
      textBoxes.style.height = newHeight + "px";
    } 
    
  } else if (message.header === "saveSignature") {

    console.log("Got Save Signature Message!");

    // message.data could be the new signature

    // save message.data to data.data via POST call to fetch('data/signature.json')
    
    sendResponse({header: "successful"});
    // Reload signature.json
    
  } else if (message.header === "fixWhiteSpace"){
    fixWhiteSpace = message.fixWhiteSpace;
    console.log("Got Fix Whitespace Message");
    console.log(fixWhiteSpace);
    sendResponse({header: "successful"});
    removeWhiteSpace(fixWhiteSpace);

  // Get resolution notes information 
  } else if (message.header === "setResolutionNotes"){
    resolutionnotes = message.resolutionnotes;
    console.log("Got Set Resolution Notes Message");
    console.log(resolutionnotes);
    sendResponse({header: "successful"});
    setResolutionNotes();

  // Else in this case is do an update for the Comment Resizer
  } else {

    enabled = message.enabled; 
    console.log("Updated Enabled to: " + enabled);
    maxHeight = message.maxHeight;
    console.log("Updated maxHeight to: " + maxHeight);

    // Call Resize w/ our current values, which are 
    enabled = message.enabled;
    maxHeight = message.maxHeight;
    reSize();

    let msg = {
      header: "successful",
      enabled: enabled,
      maxHeight: maxHeight
    }
    sendResponse(msg);
  }
}

// The function that resizes all of our comment areas, the main motivation of this extension
function reSize() {
  if(enabled)
    console.log("Resizing to " + maxHeight);
  else 
    console.log("Resizing to Normal Heights");
  
  var inputSizeString = "" + maxHeight + "px";
  var comment_areas = document.getElementsByClassName("sn-widget-textblock-body sn-widget-textblock-body_formatted");

  // Reset everything back to normal, without this since we're comparing current clientHeight, we cannot grow without this
  for (var i = 0; i < comment_areas.length; i++){
    comment_areas[i].style.height = "auto"; 
  }     

  //Setting the new heights
  for (var i = 0; i < comment_areas.length; i++){
      if (enabled) {
          // This is so really small comments are expanded, probably is going to have some unwanted results, should refactor 
          if(comment_areas[i].clientHeight > maxHeight){  
              comment_areas[i].style.height = inputSizeString;
          }
      } else {
          comment_areas[i].style.height = "auto";
      }  
      
  }
}

function removeWhiteSpace(fixBool){
  if(fixBool){
    var whitespace = document.getElementById("tabs2_spacer");
    whitespace.style["height"] = "20px";
    whitespace.style["min-height"] = "20px";
    whitespace.style["max-height"] = "20px";
  } else {  // you know once we actually fix it, i think it doesn't become a problem anymore so the following is kind of useless
    var whitespace = document.getElementById("tabs2_spacer");
    whitespace.style["height"] = "auto";
    whitespace.style["min-height"] = "auto";
    whitespace.style["max-height"] = "auto";
  }
}

function setResolutionNotes(){
    try {
    var checkbox = document.getElementById("ni.sn_customerservice_case.notes_to_comments").checked;
  } catch (err){
    console.log("Mustn't be on the resolution page");
    return;
  }

  if(resolutionnotes && checkbox != null){
    //Check the resolution notes button
    document.getElementById("ni.sn_customerservice_case.notes_to_comments").checked = true;
    
  } else {
    // Do nothing 
  }

}