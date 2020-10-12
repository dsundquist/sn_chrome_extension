// Dean Sundquist
// Service Now Chrome Extension 
// Background JS
// www.deansundquist.com

// Global Variables for resizing comment areas
var enabled = false;
var maxHeight = 800;
var fixWhiteSpace = false;
var resolutionnotes = false;

//Print out current values
console.log('Background Script Created');
console.log("Current Values:");
console.log("enabled: " + enabled);
console.log("maxHeight:" + maxHeight);

// Create a stopwatch for our timer
var watch = new Stopwatch(null);

// Getting messages from either the popup or the content script
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
    
    let msg; //the response message
    // If or caller is not intializaing we'll set varaibles, otherwise we're just returning the current state
    if(message.header == ""){
        console.log("Setting Properties...")
        enabled = message.enabled; 
        console.log("Updated Enabled to: " + enabled);
        maxHeight = message.maxHeight;
        console.log("Updated maxHeight to: " + maxHeight);

        //Setup message to be sent to all tabs
        msg = {
            header: "successful",
            enabled: enabled,
            maxHeight: maxHeight,
            resolutionnotes: resolutionnotes
        }

        // We updated something so lets inform all the tabs
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, msg);
            }
        });


        msg = {
            header: "successful",
            enabled: enabled,
            maxHeight: maxHeight,
            fixWhiteSpace: fixWhiteSpace,
            resolutionnotes: resolutionnotes
        }
        sendResponse(msg);
    
    } else if (message.header == "init") {
        //Basically we we're skipping all the set code, move on 
        console.log("Got Init message");

        msg = {
            header: "successful",
            enabled: enabled,
            maxHeight: maxHeight,
            fixWhiteSpace: fixWhiteSpace,
            resolutionnotes: resolutionnotes
        }
        sendResponse(msg);
    } else if (message.header == "startWatch"){
        watch.start();
        msg = {
            header: "successful",
        }
        sendResponse(msg);
    } else if (message.header == "stopWatch"){
        watch.stop();
        msg = {
            header: "successful",
        }
        sendResponse(msg);
    } else if (message.header == "resetWatch"){
        watch.reset();
        msg = {
            header: "successful",
        }
        sendResponse(msg);
    } else if (message.header == "getWatch"){
        msg = {
            header: "successful",
            isOn : watch.isOn,
            timer : watch.getTime()
        }
        sendResponse(msg);
    } else if (message.header == "fixWhiteSpace") {
        console.log("Setting Fix White Space to: " + message.fixWhiteSpace);
        fixWhiteSpace = message.fixWhiteSpace;

        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, {header: "fixWhiteSpace", fixWhiteSpace : fixWhiteSpace});
            }
        });

        msg = {
            header: "successful"
        }
        sendResponse(msg);
    } else if (message.header == "setResolutionNotes") {
        console.log("Setting Resolution Notes Boolean: " + message.resolutionnotes);
        resolutionnotes = message.resolutionnotes;

        // Send it to the content script 
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, {header: "setResolutionNotes", resolutionnotes : resolutionnotes});
            }
        });

        msg = {
            header: "successful"
        }
        sendResponse(msg);
    }
} 
