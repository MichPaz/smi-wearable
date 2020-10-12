
window.onload = function () {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
	try {
	    tizen.application.getCurrentApplication().exit();
	} catch (ignore) {
	}
    });

    // Sample code
//    var textbox = document.querySelector('.contents');
//    textbox.addEventListener("click", function(){
//    	box = document.querySelector('#textbox');
//    	box.innerHTML = box.innerHTML == "Basic" ? "Sample" : "Basic";
//    });
    
    
    
    const FALL_LIMIT = 30;
    const USER_ID = 1;
    const PERIOD = 1000;
    const PERIODS_OF_HEART = 5;
    
    
    function sleep(ms) {
    	  return new Promise(function (resolve){setTimeout(resolve, ms)});
    	}
    
    document.addEventListener("click", async function(){	
	
    	var accelerationSensor = tizen.sensorservice.getDefaultSensor("ACCELERATION");
    	
		function onSuccess() {

		    function onchangedCB(hrmInfo) {
		    	console.log("--------------- Heart Rate -----------------")
    			const dataHeartRate = {userId: USER_ID, rate:  hrmInfo.heartRate, datetime: (new Date()).toISOString()}
    			console.log(dataHeartRate)
    			if(self.fetch) {
    				fetch("http://192.168.0.13:3000/api/heartRates", {
    					  method: "POST",
    					  headers: {
    					      'Accept': 'application/json',
    					      'Content-Type': 'application/json'
    					    },
    					  body: JSON.stringify(dataHeartRate)
    					})
    					.then(function(res){
    						console.log(res)
    					})
    			}
		        tizen.humanactivitymonitor.stop('HRM');
		    }
		    tizen.humanactivitymonitor.start('HRM', onchangedCB);
		}

		function onError(e) {
		    console.log("error " + JSON.stringify(e));
		}
		
    	
    	
    	console.log('iniciou')
    	var count = 0
    	while(true){
    		console.log('Atualizacao');
    		await sleep(PERIOD);

    		//get fall
    		var fallRate
    		function onGetSuccessCB(sensorData)
    		{
//    		  console.log("######## Get acceleration sensor data ########");
//    		  console.log("x: " + sensorData.x);
//    		  console.log("y: " + sensorData.y);
//    		  console.log("z: " + sensorData.z);
    		  fallRate = Math.sqrt(Math.pow(sensorData.x, 2) + Math.pow(sensorData.y, 2) + Math.pow(sensorData.z, 2));
    		  console.log("--------------- FALL -----------------");
    		  console.log(fallRate);
    		}

    		function onerrorCB(error)
    		{
    		  console.log("Error occurred: " + error.message);
    		}

    		function onsuccessCB()
    		{
    		  accelerationSensor.getAccelerationSensorData(onGetSuccessCB, onerrorCB);
    		}
    		accelerationSensor.start(onsuccessCB);
    		
    		
    		//req fall
    		if(fallRate>FALL_LIMIT){
    			console.log("caiu!!!!");
    			const data = {userId: USER_ID, rate: fallRate, datetime: (new Date()).toISOString()}
    			console.log(data)
    			if(self.fetch) {
    				fetch("http://192.168.0.13:3000/api/falls", {
    					  method: "POST",
    					  headers: {
    					      'Accept': 'application/json',
    					      'Content-Type': 'application/json'
    					    },
    					  body: JSON.stringify(data)
    					})
    					.then(function(res){
    						console.log(res)
    					})
    			}
    		}
    		
    		
    		if (count % PERIODS_OF_HEART == 0){
    			count = 1;
    			console.log("Medição da frequencia cardíaca")
    			
    			
    			await tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo",onSuccess, onError);
    			
    			
    		} else {
    			count = count +1;
    		}
    		
    	}
	


  });
    
};
