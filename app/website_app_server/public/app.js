var vrDisplay;
var vrFrameData;
var vrControls;
var arView;

var canvas;
var camera;
var scene;
var renderer;
var myPlane, plane;
var planeMaterials = [];

var swipecount = 0;
var totalClick = 0;
var dateNum = 14;

var anchorManager;

var CUBE_SIZE_IN_METERS = 0.18;

var colors = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xffff00),
    new THREE.Color(0xff00ff),
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ffff),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff),
    new THREE.Color(0x000000)
];





/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */
THREE.ARUtils.getARDisplay().then(function(display) {
    if (display) {
        vrFrameData = new VRFrameData();
        vrDisplay = display;
        init();
    } else {
        THREE.ARUtils.displayUnsupportedMessage();
    }
});

function init() {
    // Turn on the debugging panel
    // var arDebug = new THREE.ARDebug(vrDisplay);
    // document.body.appendChild(arDebug.getElement());

    // Setup the three.js rendering environment
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    console.log('setRenderer size', window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    canvas = renderer.domElement;
    document.body.appendChild(canvas);
    scene = new THREE.Scene();

    // Creating the ARView, which is the object that handles
    // the rendering of the camera stream behind the three.js
    // scene
    arView = new THREE.ARView(vrDisplay, renderer);

    // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
    // except when using an AR-capable browser, the camera uses
    // the projection matrix provided from the device, so that the
    // perspective camera's depth planes and field of view matches
    // the physical camera on the device.
    camera = new THREE.ARPerspectiveCamera(
        vrDisplay,
        60,
        window.innerWidth / window.innerHeight,
        vrDisplay.depthNear,
        vrDisplay.depthFar
    );

    // VRControls is a utility from three.js that applies the device's
    // orientation/position to the perspective camera, keeping our
    // real world and virtual world in sync.
    vrControls = new THREE.VRControls(camera);

    // Load textures
    for (var i = 1; i < dateNum; i++) {
        var path = "textures/faces/date" + i + ".png";
        var loader = new THREE.TextureLoader();
        var texture = loader.load(path);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        var planeGeometry = new THREE.PlaneGeometry(0.05, 0.05, 0.05);
        var planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        planeMaterials.push(planeMaterial);
    }

    // Plane for my picture
    var myLoader = new THREE.TextureLoader();
    var myPath = "textures/me3.png"
    var myTexture = myLoader.load(myPath);
    myTexture.wrapS = myTexture.wrapT = THREE.RepeatWrapping;
    var myPlaneMaterial = new THREE.MeshBasicMaterial({
        map: myTexture,
        side: THREE.DoubleSide
    });
    var myPlaneGeometry = new THREE.PlaneGeometry(0.05, 0.05, 0.05);
    myPlane = new THREE.Mesh(myPlaneGeometry, myPlaneMaterial);

    // Plane for others' pictures
    var initLoader = new THREE.TextureLoader();
    var initPath = "textures/logo.png"
    var initTexture = myLoader.load(initPath);
    initTexture.wrapS = initTexture.wrapT = THREE.RepeatWrapping;
    var initMaterial = new THREE.MeshBasicMaterial({
        map: initTexture,
        side: THREE.DoubleSide
    });
    var planeGeometry = new THREE.PlaneGeometry(0.05, 0.05, 0.05);
    plane = new THREE.Mesh(planeGeometry, initMaterial);


    // Bind our event handlers
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('touchstart', onClick, false);

    anchorManager = new THREE.ARAnchorManager(vrDisplay);

    // Kick off the render loop!
    update();
}

/**
 * The render loop, called once per frame. Handles updating
 * our scene and rendering.
 */
function update() {
    // Clears color from the frame before rendering the camera (arView) or scene.
    renderer.clearColor();

    // Render the device's camera stream on screen first of all.
    // It allows to get the right pose synchronized with the right frame.
    arView.render();

    // Update our camera projection matrix in the event that
    // the near or far planes have updated
    camera.updateProjectionMatrix();

    // From the WebVR API, populate `vrFrameData` with
    // updated information for the frame
    vrDisplay.getFrameData(vrFrameData);

    // Update our perspective camera's positioning
    vrControls.update();

    // Render our three.js virtual scene
    renderer.clearDepth();
    renderer.render(scene, camera);

    // Kick off the requestAnimationFrame to call this function
    // on the next frame
    requestAnimationFrame(update);
}

/**
 * On window resize, update the perspective camera's aspect ratio,
 * and call `updateProjectionMatrix` so that we can get the latest
 * projection matrix provided from the device
 */
function onWindowResize() {
    console.log('setRenderer size', window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * When clicking on the screen, create a cube at the user's
 * current position.
 */
function onClick(e) {



    // Fetch the pose data from the current frame
    var pose = vrFrameData.pose;

    // Convert the pose orientation and position into
    // THREE.Quaternion and THREE.Vector3 respectively
    var ori = new THREE.Quaternion(
        pose.orientation[0],
        pose.orientation[1],
        pose.orientation[2],
        pose.orientation[3]
    );

    var pos = new THREE.Vector3(
        pose.position[0],
        pose.position[1],
        pose.position[2]
    );

    var dirMtx = new THREE.Matrix4();
    dirMtx.makeRotationFromQuaternion(ori);

    var push = new THREE.Vector3(0, 0, -1.0);
    push.transformDirection(dirMtx);
    pos.addScaledVector(push, 0.125);

    if (totalClick < 2) {
        if (totalClick == 0) {
            document.getElementById('detected').style.display = "none";
            // Clone our cube object and place it at the camera's
            // current position
            let planeClone = myPlane.clone();
            scene.add(planeClone);
            pos.y+=0.03;
            planeClone.position.copy(pos);
            planeClone.quaternion.copy(ori);
            anchorManager.add(planeClone);
        } else {
            let planeClone = plane.clone();
            scene.add(planeClone);
            pos.y+=0.03;
            planeClone.position.copy(pos);
            planeClone.quaternion.copy(ori);
            anchorManager.add(planeClone);
        }
    } else {
        let meshCount = 0;
        for (let i = scene.children.length - 1; i >= 0; i--) {
            
            if (scene.children[i].type === "Mesh") {

                if(meshCount==0) setToNextMaterial(planeMaterials, swipecount, scene.children[i]);
                meshCount++;
            }
        }
        // setToNextMaterial(planeMaterials, swipecount, plane);
        swipecount++;
    }

    totalClick++;


}

function setToNextMaterial(materials, current_index, obj) {
    obj.traverse(function(child) {
        var index;
        // if not the last material
        if (current_index <= materials.length - 1) index = current_index;
        else {
            index = 0;
            swipecount = 0;
        }

        if (child instanceof THREE.Mesh) {
            child.material = materials[index];
        }
        var img = document.getElementById('profile');
        var i = index+1;
        // img.src = "./textures/frames/profile"+i+".png"
        obj.geometry.uvsNeedUpdate = true;
        obj.needsUpdate = true;
    });
}


$(document).ready(function(){

    $(".buddy").on("swiperight",function(){
      $(this).addClass('rotate-left').delay(700).fadeOut(1);
      $('.buddy').find('.status').remove();

      $(this).append('<div class="status like"><img style="width:50%;" src="./textures/frames/like.png"></div>');      
      if ( $(this).is(':last-child') ) {
        $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(300);
       } else {
          $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);
       }
    });  

   $(".buddy").on("swipeleft",function(){
    $(this).addClass('rotate-right').delay(700).fadeOut(1);
    $('.buddy').find('.status').remove();
    $(this).append('<div class="status dislike"><img style="width:50%;" src="./textures/frames/dislike.png"></div>');

    if ( $(this).is(':last-child') ) {
     $('.buddy:nth-child(1)').removeClass ('rotate-left rotate-right').fadeIn(300);
      alert(' MTA: This is the last stop of this train.');
     } else {
        $(this).next().removeClass('rotate-left rotate-right').fadeIn(400);
    } 
  });

});