import { Camera, Matrix, Mesh, Vector3 } from "@babylonjs/core";
import { Results } from "@mediapipe/hands";

interface RenderInputs {
    canvas: HTMLCanvasElement
    video: HTMLVideoElement
    result: Results
    viewport: Camera
    spheresLeft: Mesh[]
    spheresRight: Mesh[]
    landMarkPoints: number
}

/**
 * Render function is called at highest possible speed after MediaPipe hand tracking model finish it's calculation.
 */
const render = ({canvas, video, result, spheresLeft, spheresRight, landMarkPoints, viewport}: RenderInputs): void => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    for (let i = 0; i < landMarkPoints; i++) {
        spheresLeft[i].isVisible = false;
        spheresRight[i].isVisible = false;
    }

    if (!result || !result.multiHandLandmarks.length)
        return;

    for (let hand = 0; hand < result.multiHandLandmarks.length; hand++) {
        const wristFactor = result.multiHandLandmarks[hand][0].z;

        for (let i = 0; i < landMarkPoints; i++) {
            const coords = {
                x: video.videoWidth - result.multiHandLandmarks[hand][i].x * video.videoWidth,
                y: result.multiHandLandmarks[hand][i].y * video.videoHeight,
                z: result.multiHandLandmarks[hand][i].z * wristFactor
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
}

export default render