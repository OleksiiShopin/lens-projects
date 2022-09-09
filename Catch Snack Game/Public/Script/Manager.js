// -----JS CODE-----

//@input Asset.ObjectPrefab[] objectPrefab
//@ui {"widget": "separator"}
//@input float spawnFrequency {"widget":"slider","min":0, "max":3, "step":0.1}
//@input float spawnRange {"widget":"slider","min":0, "max":1, "step":0.1}
//@input float spawnRandomizer {"widget":"slider","min":0, "max":0.5, "step":0.05}
//@input float fallingSpeedMin
//@input float fallingSpeedMax
//@input float threshold {"widget":"slider","min":0, "max":0.5, "step":0.01}

//@ui {"widget": "separator"}
//@input Component.Text currentScoreNumber
//@input Component.Text currentScoreNumberFinal
//@input Component.Text topScoreNumber
//@ui {"widget": "separator"}
//@input SceneObject[] missedScoreCountObject
//@ui {"widget": "separator"}
//game state related
//@input SceneObject StartScreen
//@input SceneObject ScoreScreen
//@input SceneObject EndScreen
//0--BeforeGameStart 1--DuringGame 2--GameEnded
//@ui {"widget": "separator"}
//@input Asset.Texture shockedFace
//@input Asset.Texture smileyFace

//@input SceneObject SegmentedBackground
script.SegmentedBackground.enabled = false;

//@ui {"widget": "separator"}

//@input Component.AudioComponent Sound_BGM
//@input Component.AudioComponent Sound_ERROR
//@input Component.AudioComponent Sound_SUCCESS

//  --storege section--
//create reference to global persistent storage system
var store = global.persistentStorageSystem.store;
//create a key to identify the variable to be saved
var scoreKey = "topScore";
//get from saved variable every time lens starts
topScore = store.getInt(scoreKey);
script.topScoreNumber.text = topScore.toString();
//  --end storege section--

global.startGame = function () {
    onGameStart();
}

// game variables
var gameState = 0;
setState(0);
var isStartGame = false;
var scoreNumber = 0;
var missedScore = 0;
var maxMissedScore = script.missedScoreCountObject.length;
var nextSpawnTime =  (1 / script.spawnFrequency) + (Math.random() - 0.5) * script.spawnRandomizer;
var spawnRange = script.spawnRange;
var spawnFrequency = script.spawnFrequency;
var spawnedObjects = [];


    
script.createEvent("UpdateEvent").bind(function(){
   if (isStartGame) {
        if(nextSpawnTime < spawnFrequency){
           nextSpawnTime += getDeltaTime();
       }else{
           spawnObject();
           nextSpawnTime = 0;
       }
       if (missedScore >= maxMissedScore) {
            onGameEnd();
        }
    }
});

function getThreshold(){
   return script.threshold;
}

function setState(gameStateInt){
   switch(gameStateInt){
       case 0://before game start
           script.StartScreen.enabled = true;
           script.ScoreScreen.enabled = false;
           script.EndScreen.enabled = false;
           script.Sound_SUCCESS.stop(false);
           script.Sound_BGM.stop(false);
       break;
       case 1://during game
           script.StartScreen.enabled = false;
           script.ScoreScreen.enabled = true;
           script.EndScreen.enabled = false;
           script.Sound_BGM.play(-1);
       break;
       case 2://after game ended
           script.StartScreen.enabled = false;
           script.ScoreScreen.enabled = false;
           script.EndScreen.enabled = true;
           global.behaviorSystem.sendCustomTrigger("SHOW_END_SCREEN");
           script.Sound_BGM.stop(false);
           script.Sound_SUCCESS.play(1);
       break;
   }
    script.SegmentedBackground.enabled = (gameStateInt != 2);
}

function onGameStart(){
   isStartGame = true;
   setState(1);
   scoreNumber = 0;
   missedScore = 0;
   script.currentScoreNumber.text = scoreNumber.toString();
   for (var i = 0; i < script.missedScoreCountObject.length; i++ ){
        script.missedScoreCountObject[i].getComponent("Component.Image").mainPass.baseTex = script.smileyFace;
   }
}

function onGameEnd(){
    isStartGame = false;
    clearSpawnedObjects();
    setState(2);
}

function spawnObject(){
   //creating a copy of the prefab
   var randomIndex = Math.floor(Math.random() * script.objectPrefab.length);
   var newObj = script.objectPrefab[randomIndex].instantiate(script.getSceneObject().getParent());
   spawnedObjects.push(newObj);

   //get screen position of this aka ObjectSpawner object
   var screenTransform = script.getSceneObject().getComponent("Component.ScreenTransform");   
   var myScreenPos = screenTransform.anchors.getCenter();

    //randomize position with range
    var randomXpos = myScreenPos.x + Math.random()*spawnRange*2 - spawnRange;    
    var newObjPosition = new vec2(randomXpos, myScreenPos.y);    
    
   //set screen position of newObj aka ObjectPrefab object
   var objScreenTransform = newObj.getComponent("Component.ScreenTransform");
   objScreenTransform.anchors.setCenter(newObjPosition);

}

function getFallingSpeed(){
   return Math.random() * (script.fallingSpeedMax - script.fallingSpeedMin) + script.fallingSpeedMin;
}

function OnHit () {
    if (isStartGame) {
        scoreNumber++;
        
        script.currentScoreNumber.text = scoreNumber.toString();
        script.currentScoreNumberFinal.text = scoreNumber.toString();
        
        if(scoreNumber > 0) {
            global.tweenManager.startTween(script.currentScoreNumber.getSceneObject(), "BOUNCE");
        }
       
        if (scoreNumber > topScore) {
            topScore = scoreNumber;
            
            store.putInt(scoreKey, topScore);
            
            script.topScoreNumber.text = topScore.toString();
        }
    }
}

function OnMissed() {
    if (isStartGame) {
        script.missedScoreCountObject[missedScore].getComponent("Component.Image").mainPass.baseTex = script.shockedFace;
        global.tweenManager.startTween( script.missedScoreCountObject[missedScore], "BOUNCE");
        script.Sound_ERROR.play(1);
        missedScore++;
    }
}

function clearSpawnedObjects () {
   for(i=0; i < spawnedObjects.length; i ++){
       spawnedObjects[i].destroy();
   }
   spawnedObjects = [];
}

script.api.getThreshold = getThreshold;
script.api.getFallingSpeed = getFallingSpeed;
script.api.OnHit = OnHit;
script.api.OnMissed = OnMissed;
