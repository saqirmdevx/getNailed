import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";

/** 
 * Build simple TUPLE with 2 arrays of 21 Spheres that we will place on each point later 
 */
const buildSpheres = (scene: Scene, landMarkPoints: number) => {
    // Create our array of spheres
    const spheresLeft: Mesh[] = [];
    const spheresRight: Mesh[] = [];
    for (let i = 0; i < landMarkPoints; i++) {
        // We should use instances to hit better performance
        spheresLeft.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 2 }, scene));
        spheresRight.push(MeshBuilder.CreateSphere("Sphere" + i, { diameter: 2 }, scene));
    }

    return [spheresLeft, spheresRight];
}

export default buildSpheres;