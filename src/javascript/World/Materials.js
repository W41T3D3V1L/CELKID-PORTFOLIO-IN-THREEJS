import * as THREE from 'three'
import FloorShadowMaterial from '../Materials/FloorShadow.js'
import MatcapMaterial from '../Materials/Matcap.js'

export default class Materials {
    constructor(_options) {
        // Options
        this.resources = _options.resources
        this.debug = _options.debug

        // Debug
        if (this.debug) {
            this.debugFolder = this.debug.addFolder('materials')
            this.debugFolder.open()
        }

        // Set up
        this.items = {}

        this.setPures()
        this.setShades()
        this.setFloorShadow()
    }

    setPures() {
        this.pures = {}
        this.pures.items = {}

        this.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.pures.items.red.name = 'pureRed'

        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.pures.items.white.name = 'pureWhite'

        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })
        this.pures.items.yellow.name = 'pureYellow'
    }

    setShades() {
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#9292a6';

        this.shades.uniforms = {
            uRevealProgress: 0,
            uIndirectDistanceAmplitude: 1.75,
            uIndirectDistanceStrength: 0.5,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        const matcaps = {
            white: 'matcapWhiteTexture',
            orange: 'matcapOrangeTexture',
            green: 'matcapGreenTexture',
            brown: 'matcapBrownTexture',
            gray: 'matcapGrayTexture',
            beige: 'matcapBeigeTexture',
            red: 'matcapRedTexture',
            black: 'matcapBlackTexture',
            emeraldGreen: 'matcapEmeraldGreenTexture',
            purple: 'matcapPurpleTexture',
            blue: 'matcapBlueTexture',
            yellow: 'matcapYellowTexture',
            metal: 'matcapMetalTexture',
            gold: 'matcapGoldTexture',
            boye: 'matcapBoyeTexture', // Your custom one
            skin: 'matcapSkinTexture', // Your custom one
            skyblue: 'matcapSkyblueTexture', // Your custom one
            darkGreen: 'matcapDarkgreenTexture' // Your custom one
        }

        for (const [name, key] of Object.entries(matcaps)) {
            const mat = new MatcapMaterial()
            mat.name = `shade${name[0].toUpperCase()}${name.slice(1)}`
            mat.uniforms.matcap.value = this.resources.items[key]

            // Ensure sRGB encoding for correct color appearance
            if (this.resources.items[key]) {
                this.resources.items[key].encoding = THREE.sRGBEncoding
                this.resources.items[key].needsUpdate = true
            }

            this.shades.items[name] = mat
            this.items[name] = mat
        }

        this.shades.updateMaterials = () => {
            this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

            for (const _uniformName in this.shades.uniforms) {
                const _uniformValue = this.shades.uniforms[_uniformName]

                for (const _materialKey in this.shades.items) {
                    const material = this.shades.items[_materialKey]
                    if (material.uniforms[_uniformName]) {
                        material.uniforms[_uniformName].value = _uniformValue
                    }
                }
            }
        }

        this.shades.updateMaterials()

        // Debug
        if (this.debug) {
            const folder = this.debugFolder.addFolder('shades')
            folder.open()

            folder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(3).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(-2).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.addColor(this.shades, 'indirectColor').onChange(this.shades.updateMaterials)
        }
    }

    setFloorShadow() {
        this.items.floorShadow = new FloorShadowMaterial()
        this.items.floorShadow.depthWrite = false
        this.items.floorShadow.shadowColor = '#9292a6';
        this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
        this.items.floorShadow.uniforms.uAlpha.value = 0

        this.items.floorShadow.updateMaterials = () => {
            this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

            if (!this.objects || !this.objects.items) return

            for (const _item of this.objects.items) {
                for (const _child of _item.container.children) {
                    if (_child.material instanceof THREE.ShaderMaterial) {
                        if (_child.material.uniforms.uShadowColor) {
                            _child.material.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
                        }
                    }
                }
            }
        }

        // Debug
        if (this.debug) {
            const folder = this.debugFolder.addFolder('floorShadow')
            folder.open()

            folder.addColor(this.items.floorShadow, 'shadowColor').onChange(this.items.floorShadow.updateMaterials)
        }
    }
}
