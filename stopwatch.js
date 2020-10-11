
// Not written by me, Created by Saadq
// https://gist.github.com/anonymous/fe5cdd7e9cd14fea796b27d19f8d1cb6
// Credit: https://github.com/saadq?tab=repositories
// Slightly modified, for hours, and for creating a new stopwatch from an existing interval

function Stopwatch(elm) {
  var time = 0;
  var offset;
  var interval;

  function update() {
    if (this.isOn) {
      time += delta();
    }
    
    if (elm != null)
      elm.textContent = timeFormatter(time);
  }

  function delta() {
    var now = Date.now();
    var timePassed = now - offset;

    offset = now;

    return timePassed;
  }

  function timeFormatter(time) {
    time = new Date(time);

    var hours = (time.getHours() - 18).toString();
    var minutes = time.getMinutes().toString();
    var seconds = time.getSeconds().toString();
    var milliseconds = time.getMilliseconds().toString();

    if (hours.length < 2) {
      hours = '0' + hours;
    }

    if (minutes.length < 2) {
      minutes = '0' + minutes;
    }

    if (seconds.length < 2) {
      seconds = '0' + seconds;
    }

    while (milliseconds.length < 3) {
      milliseconds = '0' + milliseconds;
    }

    // Change made by me, not interested int miliseconds, below is the original code
    // return minutes + ' : ' + seconds + ' . ' + milliseconds;
    return hours + ':' + minutes + ':' + seconds;
    
  }

  this.start = function() {
    interval = setInterval(update.bind(this), 10);
    offset = Date.now();
    this.isOn = true;
  };

  this.stop = function() {
    clearInterval(interval);
    interval = null;
    this.isOn = false;
  };

  this.reset = function() {
    time = 0;
    update();
  };

  this.getTime = function(){
    console.log("The current timer is: " + new Date(time));
    return time;
  }

  this.setTime = function(input) {
    time = input;
  }

  this.updateText = function() {
    if (this.isOn) {
      time += delta();
    }
    
    if (elm != null)
      elm.textContent = timeFormatter(time);
  }

  this.isOn = false;
}