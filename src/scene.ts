import { Scene, Engine, HemisphericLight, Vector3, FreeCamera } from "@babylonjs/core";

export const initializeScene = (engine: Engine, cameraHeight: number) => {
    const scene = new Scene(engine);

    //scene.debugLayer.show();

    const camera = new FreeCamera("Camera", new Vector3(0, 0, -cameraHeight), scene);
    new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    return scene;
}