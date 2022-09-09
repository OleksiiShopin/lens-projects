// -----JS CODE-----

// @input Component.ScriptComponent worldObjectController
// @input Component.DeviceTracking deviceTrackingComponent

var resetEvent = true;
function onSurfaceReset(eventData)
{
    
    if(script.deviceTrackingComponent)
    {
        script.deviceTrackingComponent.surfaceTrackingTarget = script.getSceneObject();
    }
}
var worldTrackingResetEvent = script.createEvent("WorldTrackingResetEvent");
//worldTrackingResetEvent.bind(onSurfaceReset);
var eventTap = script.createEvent("TapEvent");

//eventTap.bind(function () {
//  // print(script.worldObjectController.api.getInitPos());
//   script.worldObjectController.api.setDefaultPos();
//   script.worldObjectController.api.initialize();
//});
eventTap.bind(onSurfaceReset);

