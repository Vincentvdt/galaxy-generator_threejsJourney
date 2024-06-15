import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()


/**
 * Galaxy
 */

const parameters = {
    count: 100000,
    size: 0.01,
    radius: 3,
    arms: 3,
    spin: 1,
    randomness: 0.2,
    armConcentration: 3,
    galaxyConcentration: 1,
    insideColor: "#ff6030",
    outsideColor: "#1b3984",
    rotationSpeed: 0.02,
}

let geometry, material, points = null
let sun = null


// Sun


const generateGalaxy = () => {

    // Clear galaxy
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
        scene.remove(sun)
    }

    sun = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: parameters.insideColor }))
    scene.add(sun)


    // Geometry
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        const radiusFromCenter = Math.pow(Math.random(), parameters.galaxyConcentration) * parameters.radius
        const spinAngle = radiusFromCenter * parameters.spin
        const armAngle = (i % parameters.arms) / parameters.arms * Math.PI * 2

        // Generate random spherical coordinates for randomness
        const randomRadius = Math.pow(Math.random(), parameters.armConcentration) * parameters.randomness
        const randomTheta = Math.random() * Math.PI * 2
        const randomPhi = Math.acos(2 * Math.random() - 1)

        // Convert the spherical randomness to Cartesian coordinates
        const randomX = randomRadius * Math.sin(randomPhi) * Math.cos(randomTheta)
        const randomY = randomRadius * Math.sin(randomPhi) * Math.sin(randomTheta)
        const randomZ = randomRadius * Math.cos(randomPhi)

        // Add the randomness to the base positions
        positions[i3] = Math.cos(armAngle + spinAngle) * radiusFromCenter + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(armAngle + spinAngle) * radiusFromCenter + randomZ

        //Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radiusFromCenter / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
    )

    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3),
    )

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()

gui.add(parameters, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, "radius").min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, "arms").min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, "spin").min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, "randomness").min(0).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, "armConcentration").min(0).max(20).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, "galaxyConcentration").min(1).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy)
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

gui.add(parameters, "rotationSpeed").min(0.001).max(4).step(0.05)

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    if (points) {
        points.rotation.y = elapsedTime * parameters.rotationSpeed
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()