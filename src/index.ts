import { Color3, Color4, Engine, FreeCamera, Matrix, Mesh, MeshBuilder, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from "@babylonjs/core";
import { initializeScene } from "./scene";
import "@babylonjs/loaders/glTF";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils"

const initialize = async () => {
    // create the canvas html element and attach it to the webpage
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const video = document.querySelector("#video") as HTMLVideoElement;
    if (!video || !canvas)
        return;

    const totalPoints = 21;
    const cameraHeight = 100;

    // initialize babylon scene and engine
    const engine = new Engine(canvas, true);
    const scene = initializeScene(engine, cameraHeight);
    const viewport = scene.activeCamera as FreeCamera;
    scene.clearColor = new Color4(0, 0, 0, 0);

    //const { meshes } = await SceneLoader.AppendAsync("/assets/", "thumb.glb", scene);
    //meshes[0].position = new Vector3(0, 0, 0);

    const myMaterial = new StandardMaterial("myMaterial", scene);

    myMaterial.diffuseColor = new Color3(1, 0, 1);
    myMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
    myMaterial.emissiveColor = new Color3(1, 0.2, 0.3);
    myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

    // create boxes
    const spheresLeft: Mesh[] = [];
    const spheresRight: Mesh[] = [];
    for (let i = 0; i < totalPoints; i++) {
        spheresLeft.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 5 }, scene));
        spheresRight.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 5 }, scene));

        spheresRight[i].material = myMaterial;
    }

    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((result) => {
        for (let i = 0; i < totalPoints; i++) {
            spheresLeft[i].isVisible = false;
            spheresRight[i].isVisible = false;
        }
        if (!result || !result.multiHandLandmarks.length)
            return;

        for (let hand = 0; hand < result.multiHandLandmarks.length; hand++) {
            const wristFactor = result.multiHandLandmarks[hand][0].z * video.videoWidth * 1000;

            for (let i = 0; i < totalPoints; i++) {
                const coords = {
                    x: result.multiHandLandmarks[hand][i].x * video.videoWidth,
                    y: result.multiHandLandmarks[hand][i].y * video.videoHeight,
                    z: result.multiHandLandmarks[hand][i].z * video.videoWidth
                }

                const vector = Vector3.Unproject(
                    new Vector3(coords.x, coords.y, 1),
                    video.videoWidth,
                    video.videoHeight,
                    Matrix.Identity(),
                    viewport.getViewMatrix(),
                    viewport.getProjectionMatrix());

                if (result.multiHandedness[hand].label == "Right") {
                    spheresRight[i].isVisible = true;
                    spheresRight[i].position.x = vector.x / cameraHeight;
                    spheresRight[i].position.y = vector.y / cameraHeight;

                    //spheresRight[i].scaling.set(factor, factor, factor)
                } else {
                    // We substract from projection camera height
                    spheresLeft[i].isVisible = true;
                    spheresLeft[i].position.x = vector.x / cameraHeight;
                    spheresLeft[i].position.y = vector.y / cameraHeight;
                    spheresLeft[i].position.z = wristFactor;

                    //spheresRight[i].scaling.set(factor, factor, factor)
                }
            }
        }
    });

    const camera = new Camera(video, {
        onFrame: async () => {
            await hands.send({ image: video });
        },
        width: video?.clientWidth,
        height: video?.clientHeight
    });

    // run the main render loop
    engine.runRenderLoop(() => scene.render());
    camera.start();
}

window.onload = initialize;

export const screenToWorld = (x: number, y: number, engine: Engine, scene: Scene, depth: number): Vector3 => {
    const screenPosition = new Vector3(x, y, depth)
    const vector = Vector3.Unproject(
        screenPosition,
        engine.getRenderWidth(),
        engine.getRenderHeight(),
        Matrix.Identity(),
        scene.getViewMatrix(),
        scene.getProjectionMatrix()
    )

    return vector
}