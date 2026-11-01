import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

export default function Room3DExplorer({ roomNumber = 'A-204', occupants = [], inventory }) {
  const mountRef = useRef(null)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [fanRunning, setFanRunning] = useState(true)

  const fanRef = useRef(null)
  const animFrameId = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 700
    const height = container.clientHeight || 450

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xfff7f7)

    // 2. Camera (Isometric Perspective)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(12, 11, 14)
    camera.lookAt(0, 1.5, 0)

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.replaceChildren(renderer.domElement)

    // 4. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xfff1e6, 1.2)
    sun.position.set(8, 14, 6)
    sun.castShadow = true
    scene.add(sun)

    // 5. Room Shell (Floor + 2 Walls)
    const floorGeo = new THREE.BoxGeometry(10, 0.3, 10)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xfde2e4, roughness: 0.5 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.y = -0.15
    floor.receiveShadow = true
    scene.add(floor)

    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(10, 6, 0.3)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    const backWall = new THREE.Mesh(backWallGeo, wallMat)
    backWall.position.set(0, 3, -5)
    backWall.receiveShadow = true
    scene.add(backWall)

    // Left Wall
    const leftWallGeo = new THREE.BoxGeometry(0.3, 6, 10)
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat)
    leftWall.position.set(-5, 3, 0)
    leftWall.receiveShadow = true
    scene.add(leftWall)

    // 6. Furniture
    // Bed 1
    const createBed = (x, z, label, occupantName) => {
      const bedGroup = new THREE.Group()
      bedGroup.position.set(x, 0, z)

      // Bed Frame
      const frameGeo = new THREE.BoxGeometry(3.2, 0.6, 5)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x991b1b })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.y = 0.3
      frame.castShadow = true
      bedGroup.add(frame)

      // Mattress
      const matGeo = new THREE.BoxGeometry(3, 0.4, 4.8)
      const matMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
      const mattress = new THREE.Mesh(matGeo, matMat)
      mattress.position.y = 0.7
      mattress.castShadow = true
      bedGroup.add(mattress)

      // Blanket
      const blanketGeo = new THREE.BoxGeometry(3, 0.45, 3)
      const blanketMat = new THREE.MeshStandardMaterial({ color: 0xf87171 })
      const blanket = new THREE.Mesh(blanketGeo, blanketMat)
      blanket.position.set(0, 0.72, 0.8)
      bedGroup.add(blanket)

      // Pillow
      const pillowGeo = new THREE.BoxGeometry(2.2, 0.3, 1)
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfef2f2 })
      const pillow = new THREE.Mesh(pillowGeo, pillowMat)
      pillow.position.set(0, 0.85, -1.7)
      bedGroup.add(pillow)

      bedGroup.userData = { type: 'BED', label, occupant: occupantName || 'Vacant & Clean' }
      scene.add(bedGroup)
      return bedGroup
    }

    createBed(-3, -2, 'Bed #1', occupants[0]?.fullName || 'Rahul Sharma (CS2021001)')
    createBed(3, -2, 'Bed #2', occupants[1]?.fullName || 'Vacant Bed')

    // Study Desk
    const deskGroup = new THREE.Group()
    deskGroup.position.set(-3, 0, 3.2)
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.15, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d })
    )
    deskTop.position.y = 1.6
    deskTop.castShadow = true
    deskGroup.add(deskTop)

    // Laptop
    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.05, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    )
    laptopBase.position.set(0, 1.7, 0)
    deskGroup.add(laptopBase)

    const laptopScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1d4ed8, emissiveIntensity: 0.5 })
    )
    laptopScreen.position.set(0, 1.95, -0.28)
    laptopScreen.rotation.x = -0.2
    deskGroup.add(laptopScreen)

    deskGroup.userData = {
      type: 'DESK',
      label: 'Study Desk & Chair',
      status: inventory?.tableCondition || 'EXCELLENT Condition'
    }
    scene.add(deskGroup)

    // Ceiling Fan
    const fanGroup = new THREE.Group()
    fanGroup.position.set(0, 5.2, 0)

    const fanRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    )
    fanGroup.add(fanRod)

    const fanMotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    )
    fanMotor.position.y = -0.5
    fanGroup.add(fanMotor)

    const bladesGroup = new THREE.Group()
    bladesGroup.position.y = -0.55
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.04, 2.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      blade.rotation.y = (i * Math.PI * 2) / 3
      blade.position.set(
        Math.sin((i * Math.PI * 2) / 3) * 1,
        0,
        Math.cos((i * Math.PI * 2) / 3) * 1
      )
      bladesGroup.add(blade)
    }
    fanGroup.add(bladesGroup)
    fanRef.current = bladesGroup

    fanGroup.userData = {
      type: 'FAN',
      label: 'Ceiling Fan',
      status: inventory?.fanCondition || 'WORKING PROPERLY'
    }
    scene.add(fanGroup)

    // Raycaster for clicking 3D furniture
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      if (intersects.length > 0) {
        let parent = intersects[0].object
        while (parent && !parent.userData?.type && parent.parent) {
          parent = parent.parent
        }
        if (parent?.userData?.type) {
          setActiveHotspot(parent.userData)
        }
      }
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    // Animation Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate)

      if (fanRef.current && fanRunning) {
        fanRef.current.rotation.y += 0.08
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      }
      cancelAnimationFrame(animFrameId.current)
      renderer.dispose()
    }
  }, [fanRunning, occupants, inventory])

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-rose-200 shadow-xl bg-white/70">
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Top Banner */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-rose-200 shadow-md">
          <span className="text-xs font-bold text-[#3f0d12]">
            🏢 3D Isometric View: Room {roomNumber}
          </span>
        </div>

        <button
          onClick={() => setFanRunning(!fanRunning)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border shadow-md transition-all ${
            fanRunning ? 'bg-red-600 text-white border-red-600' : 'bg-white/90 text-stone-700 border-rose-200'
          }`}
        >
          {fanRunning ? '🌀 Fan ON' : '⏸️ Fan OFF'}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-[11px] text-stone-500 bg-white/80 px-3 py-1 rounded-lg backdrop-blur">
        💡 Tip: Click on beds, study desk, or ceiling fan to inspect inventory conditions.
      </div>

      {/* Hotspot Popup */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 z-20 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200 p-4 shadow-2xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-rose-100 font-bold text-[#3f0d12]">
              <span>{activeHotspot.label}</span>
              <button onClick={() => setActiveHotspot(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            {activeHotspot.occupant && (
              <div className="text-stone-700">
                Occupant: <strong className="text-red-700">{activeHotspot.occupant}</strong>
              </div>
            )}
            {activeHotspot.status && (
              <div className="text-stone-700">
                Audit Condition: <strong className="text-emerald-700">{activeHotspot.status}</strong>
              </div>
            )}
            <div className="text-[10px] text-stone-500 italic">
              Verified by Hostel Care digital room checklist.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
