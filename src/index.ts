import {  FreeCamera, Matrix, Mesh, MeshBuilder, Vector3 } from "@babylonjs/core";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils"
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { initializeScene } from "./scene";

const initialize = async () => {
    // create the canvas html element and attach it to the webpage
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const video = document.querySelector("#video") as HTMLVideoElement;
    if (!video || !canvas)
        return;

    const totalPoints = 21;

    // initialize babylon scene and engine
    const scene = initializeScene(canvas);
    const viewport = scene.activeCamera as FreeCamera;

    // Create our array of spheres
    const spheresLeft: Mesh[] = [];
    const spheresRight: Mesh[] = [];
    for (let i = 0; i < totalPoints; i++) {
        // We should use instances to hit better performance
        spheresLeft.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 2 }, scene));
        spheresRight.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 2 }, scene));
    }

    /** Locate Hand tracking ML Trained model */
    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    /** Settings for our MediaPipe hand tracking model */
    hands.setOptions({
        selfieMode: true,
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    let camera = new Camera(video, {
        onFrame: async () =>  await hands.send({ image: video }),
        width: window.innerWidth,
        height: window.innerHeight,
        facingMode: "environment"
    });

    hands.onResults((result) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        for (let i = 0; i < totalPoints; i++) {
            spheresLeft[i].isVisible = false;
            spheresRight[i].isVisible = false;
        }

        if (!result || !result.multiHandLandmarks.length)
            return;

        for (let hand = 0; hand < result.multiHandLandmarks.length; hand++) {
            const wristFactor = result.multiHandLandmarks[hand][0].z;

            for (let i = 0; i < totalPoints; i++) {
                const coords = {
                    x: video.videoWidth - result.multiHandLandmarks[hand][i].x * video.videoWidth,
                    y: result.multiHandLandmarks[hand][i].y * video.videoHeight,
                    z: result.multiHandLandmarks[hand][i].z * wristFactor
                }

                viewport.position.z =  -100;

                const vector = Vector3.Unproject(
                    new Vector3(coords.x, coords.y, 1),
                    video.videoWidth,
                    video.videoHeight,
                    Matrix.Identity(),
                    viewport.getViewMatrix(),
                    viewport.getProjectionMatrix());

                if (result.multiHandedness[hand].label == "Right") {
                    spheresRight[i].isVisible = true;
                    spheresRight[i].position.x = vector.x / 100;
                    spheresRight[i].position.y = vector.y / 100;
                } else {
                    // We substract from projection camera height
                    spheresLeft[i].isVisible = true;
                    spheresLeft[i].position.x = vector.x / 100;
                    spheresLeft[i].position.y = vector.y / 100;
                    //spheresLeft[i].position.z = vector.z;
                } 
            }
        }
    });

    camera.start();
}

window.onload = initialize;