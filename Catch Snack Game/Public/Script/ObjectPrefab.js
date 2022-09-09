// -----JS CODE-----
//@input Component.ScriptComponent objectSpawner
//@input Component.ScriptComponent textureDuplicationHelper

//@input SceneObject mouthPositionObject

//@input Component.Camera camera
//@input Component.Head headTracking


var screenTransform = script.getSceneObject().getComponent("Component.ScreenTransform");
var fallingSpeed = script.objectSpawner.api.getFallingSpeed();
script.api.getMouthPosition = getMouthPosition;

var threshold = script.objectSpawner.api.getThreshold();
var distanceFromMouth = 0;
var aspectRatio = script.camera.aspect;
var audioComponent = script.getSceneObject().getComponent("Component.AudioComponent");

var isHit = false;
var isMouthOpened = false;

script.createEvent("MouthOpenedEvent").bind(function(){
    isMouthOpened = true;
});

script.createEvent("MouthClosedEvent").bind(function(){
    isMouthOpened = false;
});


script.createEvent("UpdateEvent").bind(function () {
    var currentPos = screenTransform.anchors.getCenter();    
    currentPos.y -= fallingSpeed * getDeltaTime();
    
    //-1 would be the bottom of screen, so -1.5 would be a safe y position to destroy object
    if(currentPos.y < -1.5){
        script.objectSpawner.api.OnMissed();
        script.getSceneObject().enabled = false;
    }
  
    screenTransform.anchors.setCenter(currentPos);
    
    distanceFromMouth = getDistance(currentPos, getMouthPosition());
    
    if (distanceFromMouth < threshold 
        && !isHit 
        && isMouthOpened 
        && (script.headTracking.getFacesCount() > 0 )) {
        onHit();
    }
    
    if(isHit){
       var animatedTex = script.getSceneObject().getComponent("Component.Image").getMaterial(0).mainPass.baseTex;

       if(animatedTex.control.isFinished()){
           script.getSceneObject().enabled = false;
       }
   }
});

function getMouthPosition(){
   var mouthWorldPos = script.mouthPositionObject.getTransform().getWorldPosition();
   var mouthPos = script.camera.worldSpaceToScreenSpace(mouthWorldPos);
   mouthPos = new vec2(mouthPos.x*2-1, 1-mouthPos.y*2);
    
   return mouthPos;
}

function getDistance(pos1, pos2){
    //get x y distance (screen space) between 2 points
    var xDistance = Math.abs(pos1.x - pos2.x);
    var yDistance = Math.abs(pos1.y - pos2.y);
    
    //multiplies aspect ratio to y
    yDistance /= aspectRatio;
    
    //get diagonal distance
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function onHit () {
    script.textureDuplicationHelper.api.playHitAnimation(script.getSceneObject());
    script.objectSpawner.api.OnHit();        
        
    audioComponent.play(1);

    isHit = true;
}
