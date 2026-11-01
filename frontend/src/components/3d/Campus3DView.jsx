import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

export default function Campus3DView({ onBuildingSelect, stats }) {
  const mountRef = useRef(null)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [isNightMode, setIsNightMode] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  // References for animation
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const animFrameId = useRef(null)
  const buildingsMapRef = useRef(new Map())
  const lightsRef = useRef({})

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    // 1. SCENE
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(isNightMode ? 0x0f172a : 0xfff5f5)
    scene.fog = new THREE.FogExp2(isNightMode ? 0x0f172a : 0xfff5f5, 0.015)

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(30, 25, 35)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.replaceChildren(renderer.domElement)

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(
      isNightMode ? 0x334155 : 0xffffff,
      isNightMode ? 0.7 : 0.8
    )
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(
      isNightMode ? 0x60a5fa : 0xffedd5,
      isNightMode ? 0.8 : 1.2
    )
    dirLight.position.set(20, 40, 20)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)
    lightsRef.current = { ambient: ambientLight, dir: dirLight }

    // 5. GROUND
    const groundGeo = new THREE.PlaneGeometry(80, 80)
    const groundMat = new THREE.MeshStandardMaterial({
      color: isNightMode ? 0x1e293b : 0xf1f5f9,
      roughness: 0.8
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid helper
    const gridHelper = new THREE.GridHelper(70, 35, 0xfca5a5, 0xfecdd3)
    gridHelper.position.y = 0.02
    scene.add(gridHelper)

    // 6. BUILDINGS BUILDER
    const buildingsGroup = new THREE.Group()
    scene.add(buildingsGroup)

    const createBuilding = (name, x, z, w, h, d, color, labelText) => {
      const group = new THREE.Group()
      group.position.set(x, 0, z)
      group.name = name

      // Main Block
      const geo = new THREE.BoxGeometry(w, h, d)
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.1
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = h / 2
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { name, label: labelText }
      group.add(mesh)

      // Roof Accent
      const roofGeo = new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4)
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 })
      const roof = new THREE.Mesh(roofGeo, roofMat)
      roof.position.y = h + 0.2
      roof.castShadow = true
      group.add(roof)

      // Windows Matrix
      const winGeo = new THREE.PlaneGeometry(0.6, 0.9)
      const winMat = new THREE.MeshBasicMaterial({
        color: isNightMode ? 0xfef08a : 0xbfdbfe,
        side: THREE.DoubleSide
      })

      const floors = Math.floor(h / 2)
      for (let f = 1; f <= floors; f++) {
        for (let side = -w / 3; side <= w / 3; side += 1.8) {
          const win = new THREE.Mesh(winGeo, winMat)
          win.position.set(side, f * 1.8 - 0.5, d / 2 + 0.02)
          group.add(win)
        }
      }

      // Floating Marker Beacon
      const beaconGeo = new THREE.SphereGeometry(0.3, 16, 16)
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 })
      const beacon = new THREE.Mesh(beaconGeo, beaconMat)
      beacon.position.y = h + 2
      group.add(beacon)

      buildingsGroup.add(group)
      buildingsMapRef.current.set(name, mesh)
      return group
    }

    // Build Campus Facilities
    createBuilding('BLOCK_A', -12, -6, 12, 10, 8, 0xffffff, 'Block A (Boys Hostel)')
    createBuilding('BLOCK_B', 12, -6, 12, 10, 8, 0xffffff, 'Block B (Girls Hostel)')
    createBuilding('MESS', 0, 10, 14, 5, 10, 0xfef2f2, 'Central Dining Mess Hall')
    createBuilding('SECURITY_GATE', 0, -22, 10, 4, 3, 0xfecaca, 'Main Security Gate & Kiosk')

    // Pathway
    const pathGeo = new THREE.PlaneGeometry(4, 34)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
    const path = new THREE.Mesh(pathGeo, pathMat)
    path.rotation.x = -Math.PI / 2
    path.position.set(0, 0.03, -6)
    scene.add(path)

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(buildingsGroup.children, true)

      if (intersects.length > 0) {
        let parent = intersects[0].object
        while (parent && !parent.userData?.name && parent.parent) {
          parent = parent.parent
        }
        const data = parent?.userData || intersects[0].object.userData
        if (data && data.name) {
          setSelectedBuilding(data)
          if (onBuildingSelect) onBuildingSelect(data.name)
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    // 7. ANIMATION LOOP
    let angle = 0
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate)

      if (autoRotate) {
        angle += 0.003
        camera.position.x = 36 * Math.cos(angle)
        camera.position.z = 36 * Math.sin(angle)
        camera.lookAt(0, 3, 0)
      }

      renderer.render(scene, camera)
    }
    animate()

    // 8. RESIZE LISTENER
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      }
      cancelAnimationFrame(animFrameId.current)
      renderer.dispose()
    }
  }, [isNightMode, autoRotate])

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-rose-200 shadow-xl bg-white/60">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-rose-200 shadow-md flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-[#3f0d12]">3D Campus Digital Twin</span>
        </div>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border shadow-md transition-all ${
            autoRotate
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white/90 text-[#7f1d1d] border-rose-200 hover:bg-rose-50'
          }`}
        >
          {autoRotate ? '⏸️ Pause Orbit' : '▶️ Auto-Orbit'}
        </button>

        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/90 text-[#7f1d1d] border border-rose-200 shadow-md hover:bg-rose-50 transition-all"
        >
          {isNightMode ? '☀️ Day View' : '🌙 Night View'}
        </button>
      </div>

      {/* Floating Legend / Quick Selector */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5">
        {[
          { id: 'BLOCK_A', label: '🏢 Block A', color: 'border-blue-400' },
          { id: 'BLOCK_B', label: '🏢 Block B', color: 'border-purple-400' },
          { id: 'MESS', label: '🍲 Mess Hall', color: 'border-amber-400' },
          { id: 'SECURITY_GATE', label: '🛡️ Gate Kiosk', color: 'border-red-400' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedBuilding({ name: item.id, label: item.label })
              if (onBuildingSelect) onBuildingSelect(item.id)
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl bg-white/95 backdrop-blur border shadow-sm transition-all hover:scale-105 ${
              selectedBuilding?.name === item.id ? 'bg-red-600 text-white border-red-600' : 'text-[#3f0d12] ' + item.color
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Active Building 3D Inspector Card */}
      <AnimatePresence>
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200 p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <span className="font-bold text-sm text-[#3f0d12]">{selectedBuilding.label}</span>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {selectedBuilding.name === 'BLOCK_A' && (
              <div className="text-xs space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Occupancy:</span>
                  <strong className="text-blue-600">36 / 36 Beds (100%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Floors:</span>
                  <strong>Ground, 1st & 2nd Floor</strong>
                </div>
                <div className="flex justify-between">
                  <span>Active Complaints:</span>
                  <strong className="text-amber-600">2 In Progress</strong>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-900 text-[11px]">
                  All power fixtures and corridor WiFi routers nominal.
                </div>
              </div>
            )}

            {selectedBuilding.name === 'BLOCK_B' && (
              <div className="text-xs space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Occupancy:</span>
                  <strong className="text-purple-600">32 / 36 Beds (88%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available Beds:</span>
                  <strong className="text-emerald-600">4 Vacancies</strong>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance:</span>
                  <strong className="text-stone-700">1 Room Painting</strong>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-900 text-[11px]">
                  Biometric gate & curfew sensors operational.
                </div>
              </div>
            )}

            {selectedBuilding.name === 'MESS' && (
              <div className="text-xs space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Meal Serving:</span>
                  <strong className="text-red-600 font-bold">DINNER (19:30 - 21:30)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Expected Diners:</span>
                  <strong className="text-emerald-600">68 Students</strong>
                </div>
                <div className="flex justify-between">
                  <span>Food Waste Saved:</span>
                  <strong className="text-emerald-700">22.5 kg this week</strong>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-[11px]">
                  Sunday Feast Voting active in Student Portal.
                </div>
              </div>
            )}

            {selectedBuilding.name === 'SECURITY_GATE' && (
              <div className="text-xs space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Gate Status:</span>
                  <strong className="text-emerald-600">ONLINE • ACTIVE</strong>
                </div>
                <div className="flex justify-between">
                  <span>Students Outside:</span>
                  <strong className="text-amber-600">2 Checked Out</strong>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Incidents:</span>
                  <strong className="text-red-600 animate-pulse font-bold">1 Overdue Alert</strong>
                </div>
                <div className="p-2 rounded-lg bg-red-50 text-red-900 text-[11px]">
                  Priya Singh flagged late (75 mins past curfew).
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
