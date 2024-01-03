
import * as THREE from 'three';
import { EffectComposer } from '/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from '/jsm/postprocessing/UnrealBloomPass.js';
//import { OutputPass } from '/jsm/postprocessing/OutputPass.js';
const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const materials = {};

window.ApplyBloom = function ApplyBloom(scene, renderer) {
    window.bloomComposer = new EffectComposer(renderer);
    window.finalComposer = new EffectComposer(renderer);

    //Bloom parameters
    const params = {
        threshold: 0.001, //filtro de branco
        strength: 1, // Intensidade
        radius: 0.5, // tamanho 
        exposure: 1 // quantidade de claridade
    };

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;

    window.bloomComposer.renderToScreen = false;
    window.bloomComposer.addPass(renderScene);
    window.bloomComposer.addPass(bloomPass);

    const mixPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: window.bloomComposer.renderTarget2.texture }
            },
            vertexShader: document.getElementById('bloom-vertexshader').textContent,
            fragmentShader: document.getElementById('bloom-fragmentshader').textContent,
            defines: {}
        }), 'baseTexture'
    );
    mixPass.needsSwap = true;

    //const outputPass = new OutputPass();


    window.finalComposer.addPass(renderScene);
    window.finalComposer.addPass(mixPass);
    //window.finalComposer.addPass( outputPass );

}
window.darkenNonBloomed = function darkenNonBloomed(obj) {
    if(obj.isMesh || obj.isLine){
        if(obj.material.length>1){
            materials[ obj.uuid ] = obj.material;
            obj.material = materialsPBRDark;
        }else{
            materials[ obj.uuid ] = obj.material;
            obj.material = darkMaterial;
        }
    }
}

window.restoreMaterial = function restoreMaterial(obj) {

    if ( materials[ obj.uuid ] ) {

        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];
    }
}