var GeoprocessingTask = require("./GeoprocessingTask");

var url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/911CallsHotspot/GPServer/911%20Calls%20Hotspot";

var params = {};
params.Query = "(Date >= date '1998-01-01 12:00:00' and Date <= date '1998-01-07 12:00:00') AND (Day = 'SUN' OR Day= 'SAT' OR Day = 'FRI' OR Day ='MON' OR Day='TUE' OR Day='WED' OR Day ='THU')";

var gpTask = new GeoprocessingTask();
gpTask.submitJob("911 Calls Hot Spot", params, url).then((results) =>{
    console.log("Success");
}, (error) => {
   console.log(error); 
});