import * as THREE from 'three';

let boxClose;
let vertexList = [];
let metricsList = [];
let measureListElement;
let closeListElement;
let measureList = [];
let closeList = [];
let markers = [];

const markerSize = 2;
const markerHsegments = 12;
const markerWsegments = 12;

let refSphere;

function PickRulerPoint(objects) {

    let dist = 99999;
    let index = -1;
    for (let i = 0; i < objects.length; i++) {
        if (dist > objects[i].distance) {
            dist = objects[i].distance;
            index = i;
        }
    }

    //constants 
    if (!objects[index])
        return null;
    else {
        return objects[index].point;
    }


}

function AddLine(v1, v2) {

    const material = new THREE.LineBasicMaterial({ color: 0xff00 });
    const points = [];
    points.push(v1);
    points.push(v2);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    material.depthTest = false;
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 1;
    scene.add(line);
    return line;
}

function HideSphere() {
    if (refSphere) refSphere.visible = false;

}

function MovePoint(point) {
    if(metricsList.length >= 8) return;
    if (!refSphere) {
        const geometry = new THREE.SphereGeometry(markerSize, markerHsegments, markerWsegments);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        material.depthTest = false;
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.set(point.x + (markerSize / 2), point.y + (markerSize / 2), point.z + (markerSize / 2));
        sphere.renderOrder = 1;

        scene.add(sphere);
        refSphere = sphere;
    }

    refSphere.visible = true;
    refSphere.position.set(point.x, point.y, point.z);
}
function AddPoint(point) {


    const geometry = new THREE.SphereGeometry(markerSize, markerHsegments, markerWsegments);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    material.depthTest = false;
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(point.x + (markerSize / 2), point.y + (markerSize / 2), point.z + (markerSize / 2));
    sphere.renderOrder = 1;

    scene.add(sphere);
    vertexList.push(sphere.position);
    markers.push(sphere);

}

window.RulerRaycast = function RulerRaycast(camera, scene) {

    raycaster.setFromCamera(pointer, camera);
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(window.sceneObjects);

    const point = PickRulerPoint(intersects);
    if (!point) {
        HideSphere();
        return;
    }
    MovePoint(point);




}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clickPointer = new THREE.Vector2();
const limitThreshold = 0.1;
function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

function UpdateFields() {
    if (!measureListElement) {
        measureListElement = document.getElementById("measureList");
    }
    if(!closeListElement){
        closeListElement = document.getElementById("closeList");
    }
    var diff = metricsList.length - measureList.length;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
            var element = document.createElement("div");
            var trash = document.createElement("div");
            trash.textContent = "X";
            //element.appendChild(trash);
            measureListElement.appendChild(element);
            closeListElement.appendChild(trash);

            measureList.push(element);
            closeList.push(trash);
        }
    }
    for (let i = 0; i < metricsList.length; i++) {
        measureList[i].textContent = metricsList[i].distance.toFixed(2) + 'cm';
        measureList[i].index = i;
        measureList[i].addEventListener("mouseover",onMeasureMouseOver);
        measureList[i].addEventListener("mouseout",onMeasureMouseOut);
        closeList[i].index = i;
        closeList[i].id = "X"+i;
        closeList[i].addEventListener("click",onCloseMeasureButton)
    }
}
function RemoveElement(index){
   closeList[index].remove();
   measureList[index].remove();
   scene.remove(metricsList[index].marker1);
   scene.remove(metricsList[index].marker2);
   scene.remove(metricsList[index].line);
   delete closeList[index];
   delete measureList[index];
   delete metricsList[index];
   var newCloseArray = [];
   var newMeasureArray = [];
    var newMetricsArray = [];
    for(let i =0; i < closeList.length; i++){
        if(closeList[i]){
            newCloseArray.push(closeList[i]);
        }
        if(measureList[i]){
            newMeasureArray.push(measureList[i]);
        }
        if(metricsList[i]){
            newMetricsArray.push(metricsList[i]);
        }
    }
    closeList = newCloseArray;
    measureList = newMeasureArray;
    metricsList = newMetricsArray;

    UpdateFields();
}
function ResetHighlight(){
    for(let i = 0; i<metricsList.length; i++){

        metricsList[i].marker1.material.color = new THREE.Color(0xffffff);
        metricsList[i].marker2.material.color = new THREE.Color(0xffffff);
        metricsList[i].marker1.scale.set(1,1,1);
        metricsList[i].marker2.scale.set(1,1,1);
   }
}
function HighlightMarkers(index){
   for(let i = 0; i<metricsList.length; i++){

        metricsList[i].marker1.material.color = new THREE.Color(0xffffff);
        metricsList[i].marker2.material.color = new THREE.Color(0xffffff);
        metricsList[i].marker1.scale.set(1,1,1);
        metricsList[i].marker2.scale.set(1,1,1);


   }
   const highlightScale = 3;
   const highlightColor = 0x00ff00;
   metricsList[index].marker1.material.color = new THREE.Color(highlightColor);
   metricsList[index].marker2.material.color = new THREE.Color(highlightColor);
   metricsList[index].marker1.scale.set(highlightScale,highlightScale,highlightScale);
   metricsList[index].marker2.scale.set(highlightScale,highlightScale,highlightScale);

}
function onCloseMeasureButton(event){
    var index = event.currentTarget.index;
    RemoveElement(index);
}
function onMeasureMouseOut(event){
    ResetHighlight(); 
}
function onMeasureMouseOver(event){
   var index = event.currentTarget.index;
   HighlightMarkers(index);
}

function OnMouseDown(event) {
    //saves pointer on click
    clickPointer.x = pointer.x;
    clickPointer.y = pointer.y;
}

function onClick(event) {
    //check if pointer moved less than the threshold
    if (clickPointer && clickPointer.distanceTo(pointer) < limitThreshold) {
        if (refSphere && refSphere.visible) {
            AddPoint(refSphere.position);
            if (vertexList.length !== 0 && vertexList.length % 2 == 0) {
                const v1 = vertexList[vertexList.length - 1];
                const v2 = vertexList[vertexList.length - 2];

                const m1= markers[markers.length - 1];
                const m2= markers[markers.length - 2];
                const line = AddLine(v1, v2);
                metricsList.push({ distance: v1.distanceTo(v2), point1: v1, marker1:m1, point2: v2, marker2:m2, line:line });
                UpdateFields();
                HideSphere();

            }
        }
    }
}

function onExitClick(event) {
    rulerAddPoint = false;
    window.boxBase.style.display = 'none';

}
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('click', onClick);
window.addEventListener('mousedown', OnMouseDown);
window.boxBase = document.getElementById("boxBase");
boxClose = document.getElementById("boxClose");
boxClose.addEventListener('click', onExitClick);

