// ASCII Water by Originkit. FLIP solver after Matthias Müller, with glyph ramps
// from javierbyte/fluid-triangle. Runs off the main thread.
const GRAVITY = -9.81

// One character of margin sideways and two top and bottom sit outside the
// readout, so the tank walls — which the solver pins to zero velocity — never
// show up as a stalled band of glyphs along the edge.
const CROP_X = 1
const CROP_Y = 2

// The tank is always two units tall; every other length derives from that.
const SIM_HEIGHT = 2.0

// Tank units per second. Below the minimum the cursor counts as parked and the
// brush is off entirely; the maximum is what one violent flick is allowed to
// hand the water, which is already several tank-heights a second.
const STIR_MIN_SPEED = 0.15
const STIR_MAX_SPEED = 15

const PRESSURE_ITERS = 30
const PARTICLE_ITERS = 2
const OVER_RELAXATION = 1.9

// Glyph, and how many lit pixels it shows at a fixed size — the ramps are
// ordered by that measured weight rather than by eye, so density reads evenly.

const BASE= [
    ["~", 12198],
    [":", 6921],
    ["-", 5589],
    ["·", 3267],
    [" ", 0],
    [" ", 0],
]

const RAMPS= [
    [["F", 26574], ["F", 26574], ["f", 17490], ...BASE],
    [["L", 21327], ["L", 21327], ["l", 14019], ...BASE],
    [["U", 32973], ["U", 32973], ["u", 24093], ...BASE],
    [["I", 14883], ["I", 14883], ["i", 13638], ...BASE],
    [["D", 36198], ["D", 36198], ["d", 30762], ...BASE],
]

// Sorted once here. The original sorted inside the render loop, which re-sorted
// five arrays for every cell of every frame.
const DICTS = RAMPS.map((ramp) =>
    [...ramp]
        .sort((a, b) => a[1] - b[1])
        .map(([char]) => char)
        .join("")
)

// The supplied Originkit preset, in simulation units.
const settings = { dt: 0.37 / 60, flipRatio: 0.762, radius: 0.21, push: 0.35, clickPush: 3.48 }

function clamp(v, lo, hi, fallback){
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

const U_FIELD = 0
const FLUID_CELL = 0
const AIR_CELL = 1
const SOLID_CELL = 2

class FlipFluid {
    constructor(
        density,
        width,
        height,
        spacing,
        particleRadius,
        maxParticles
    ) {
        this.particleRestDensity = 0
        this.density = density
        this.fNumX = Math.floor(width / spacing)
        this.fNumY = Math.floor(height / spacing)
        this.h = Math.max(width / this.fNumX, height / this.fNumY)
        this.fInvSpacing = 1.0 / this.h
        this.fNumCells = this.fNumX * this.fNumY

        this.u = new Float32Array(this.fNumCells)
        this.v = new Float32Array(this.fNumCells)
        this.du = new Float32Array(this.fNumCells)
        this.dv = new Float32Array(this.fNumCells)
        this.prevU = new Float32Array(this.fNumCells)
        this.prevV = new Float32Array(this.fNumCells)
        this.p = new Float32Array(this.fNumCells)
        this.s = new Float32Array(this.fNumCells)
        this.cellType = new Int32Array(this.fNumCells)
        this.cellColor = new Float32Array(3 * this.fNumCells)

        this.maxParticles = maxParticles
        this.particlePos = new Float32Array(2 * maxParticles)
        this.particleVel = new Float32Array(2 * maxParticles)
        this.particleDensity = new Float32Array(this.fNumCells)

        this.particleRadius = particleRadius
        this.pInvSpacing = 1.0 / (2.2 * particleRadius)
        this.pNumX = Math.floor(width * this.pInvSpacing) + 1
        this.pNumY = Math.floor(height * this.pInvSpacing) + 1
        this.pNumCells = this.pNumX * this.pNumY

        this.numCellParticles = new Int32Array(this.pNumCells)
        this.firstCellParticle = new Int32Array(this.pNumCells + 1)
        this.cellParticleIds = new Int32Array(maxParticles)
    }

    integrateParticles(dt, gravity) {
        for (let i = 0; i < this.numParticles; i++) {
            this.particleVel[2 * i + 1] += dt * gravity
            this.particlePos[2 * i] += this.particleVel[2 * i] * dt
            this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt
        }
    }

    /**
     * The pointer, as a brush on particle velocity.
     *
     * Blending toward the cursor velocity rather than adding to it keeps a fast
     * flick from launching the water off the top of the frame: the fastest a
     * particle can end up moving is exactly as fast as the cursor did.
     */
    stirParticles(stir) {
        const r2 = stir.r * stir.r
        for (let i = 0; i < this.numParticles; i++) {
            const dx = this.particlePos[2 * i] - stir.x
            const dy = this.particlePos[2 * i + 1] - stir.y
            const d2 = dx * dx + dy * dy
            if (d2 > r2) continue
            const w = (1 - Math.sqrt(d2) / stir.r) * stir.strength
            this.particleVel[2 * i] += (stir.vx - this.particleVel[2 * i]) * w
            this.particleVel[2 * i + 1] +=
                (stir.vy - this.particleVel[2 * i + 1]) * w
        }
    }

    /**
     * A click, as a radial outward + upward kick — distinct from the hover
     * brush, which only ever blends particles toward the cursor's own
     * velocity. The upward bias is what makes it read as a splash: gravity
     * and the incompressible solve pull the kicked water back down and out
     * across the surface on their own, rather than it just shoving sideways.
     */
    splashParticles(x, y, r, strength) {
        const r2 = r * r
        for (let i = 0; i < this.numParticles; i++) {
            const dx = this.particlePos[2 * i] - x
            const dy = this.particlePos[2 * i + 1] - y
            const d2 = dx * dx + dy * dy
            if (d2 > r2 || d2 === 0) continue
            const d = Math.sqrt(d2)
            const w = (1 - d / r) * strength
            this.particleVel[2 * i] += (dx / d) * w
            this.particleVel[2 * i + 1] += (dy / d) * w + w * 0.5
        }
    }

    pushParticlesApart(numIters) {
        this.numCellParticles.fill(0)

        for (let i = 0; i < this.numParticles; i++) {
            const xi = clamp(
                Math.floor(this.particlePos[2 * i] * this.pInvSpacing),
                0,
                this.pNumX - 1,
                0
            )
            const yi = clamp(
                Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing),
                0,
                this.pNumY - 1,
                0
            )
            this.numCellParticles[xi * this.pNumY + yi]++
        }

        let first = 0
        for (let i = 0; i < this.pNumCells; i++) {
            first += this.numCellParticles[i]
            this.firstCellParticle[i] = first
        }
        this.firstCellParticle[this.pNumCells] = first

        for (let i = 0; i < this.numParticles; i++) {
            const xi = clamp(
                Math.floor(this.particlePos[2 * i] * this.pInvSpacing),
                0,
                this.pNumX - 1,
                0
            )
            const yi = clamp(
                Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing),
                0,
                this.pNumY - 1,
                0
            )
            const cellNr = xi * this.pNumY + yi
            this.firstCellParticle[cellNr]--
            this.cellParticleIds[this.firstCellParticle[cellNr]] = i
        }

        const minDist = 2.0 * this.particleRadius
        const minDist2 = minDist * minDist

        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 0; i < this.numParticles; i++) {
                const px = this.particlePos[2 * i]
                const py = this.particlePos[2 * i + 1]

                const pxi = Math.floor(px * this.pInvSpacing)
                const pyi = Math.floor(py * this.pInvSpacing)
                const x0 = Math.max(pxi - 1, 0)
                const y0 = Math.max(pyi - 1, 0)
                const x1 = Math.min(pxi + 1, this.pNumX - 1)
                const y1 = Math.min(pyi + 1, this.pNumY - 1)

                for (let xi = x0; xi <= x1; xi++) {
                    for (let yi = y0; yi <= y1; yi++) {
                        const cellNr = xi * this.pNumY + yi
                        const start = this.firstCellParticle[cellNr]
                        const last = this.firstCellParticle[cellNr + 1]
                        for (let j = start; j < last; j++) {
                            const id = this.cellParticleIds[j]
                            if (id === i) continue
                            let dx = this.particlePos[2 * id] - px
                            let dy = this.particlePos[2 * id + 1] - py
                            const d2 = dx * dx + dy * dy
                            if (d2 > minDist2 || d2 === 0.0) continue
                            const d = Math.sqrt(d2)
                            const s = (0.5 * (minDist - d)) / d
                            dx *= s
                            dy *= s
                            this.particlePos[2 * i] -= dx
                            this.particlePos[2 * i + 1] -= dy
                            this.particlePos[2 * id] += dx
                            this.particlePos[2 * id + 1] += dy
                        }
                    }
                }
            }
        }
    }

    handleWallCollisions() {
        const h = 1.0 / this.fInvSpacing
        const r = this.particleRadius
        const minX = h + r
        const maxX = (this.fNumX - 1) * h - r
        const minY = h + r
        const maxY = (this.fNumY - 1) * h - r

        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePos[2 * i]
            let y = this.particlePos[2 * i + 1]

            if (x < minX) {
                x = minX
                this.particleVel[2 * i] = 0.0
            }
            if (x > maxX) {
                x = maxX
                this.particleVel[2 * i] = 0.0
            }
            if (y < minY) {
                y = minY
                this.particleVel[2 * i + 1] = 0.0
            }
            if (y > maxY) {
                y = maxY
                this.particleVel[2 * i + 1] = 0.0
            }
            this.particlePos[2 * i] = x
            this.particlePos[2 * i + 1] = y
        }
    }

    updateParticleDensity() {
        const n = this.fNumY
        const h = this.h
        const h1 = this.fInvSpacing
        const h2 = 0.5 * h
        const d = this.particleDensity
        d.fill(0.0)

        for (let i = 0; i < this.numParticles; i++) {
            const x = clamp(this.particlePos[2 * i], h, (this.fNumX - 1) * h, h)
            const y = clamp(
                this.particlePos[2 * i + 1],
                h,
                (this.fNumY - 1) * h,
                h
            )

            const x0 = Math.floor((x - h2) * h1)
            const tx = (x - h2 - x0 * h) * h1
            const x1 = Math.min(x0 + 1, this.fNumX - 2)

            const y0 = Math.floor((y - h2) * h1)
            const ty = (y - h2 - y0 * h) * h1
            const y1 = Math.min(y0 + 1, this.fNumY - 2)

            const sx = 1.0 - tx
            const sy = 1.0 - ty

            if (x0 < this.fNumX && y0 < this.fNumY) d[x0 * n + y0] += sx * sy
            if (x1 < this.fNumX && y0 < this.fNumY) d[x1 * n + y0] += tx * sy
            if (x1 < this.fNumX && y1 < this.fNumY) d[x1 * n + y1] += tx * ty
            if (x0 < this.fNumX && y1 < this.fNumY) d[x0 * n + y1] += sx * ty
        }

        // Measured once, off the first settled frame — every later frame is
        // compared against it to decide what counts as compressed.
        if (this.particleRestDensity === 0.0) {
            let sum = 0.0
            let numFluidCells = 0
            for (let i = 0; i < this.fNumCells; i++) {
                if (this.cellType[i] === FLUID_CELL) {
                    sum += d[i]
                    numFluidCells++
                }
            }
            if (numFluidCells > 0)
                this.particleRestDensity = sum / numFluidCells
        }
    }

    transferVelocities(toGrid, flipRatio = 0) {
        const n = this.fNumY
        const h = this.h
        const h1 = this.fInvSpacing
        const h2 = 0.5 * h

        if (toGrid) {
            this.prevU.set(this.u)
            this.prevV.set(this.v)
            this.du.fill(0.0)
            this.dv.fill(0.0)
            this.u.fill(0.0)
            this.v.fill(0.0)

            for (let i = 0; i < this.fNumCells; i++)
                this.cellType[i] = this.s[i] === 0.0 ? SOLID_CELL : AIR_CELL

            for (let i = 0; i < this.numParticles; i++) {
                const xi = clamp(
                    Math.floor(this.particlePos[2 * i] * h1),
                    0,
                    this.fNumX - 1,
                    0
                )
                const yi = clamp(
                    Math.floor(this.particlePos[2 * i + 1] * h1),
                    0,
                    this.fNumY - 1,
                    0
                )
                const cellNr = xi * n + yi
                if (this.cellType[cellNr] === AIR_CELL)
                    this.cellType[cellNr] = FLUID_CELL
            }
        }

        for (let component = 0; component < 2; component++) {
            const dx = component === U_FIELD ? 0.0 : h2
            const dy = component === U_FIELD ? h2 : 0.0

            const f = component === U_FIELD ? this.u : this.v
            const prevF = component === U_FIELD ? this.prevU : this.prevV
            const acc = component === U_FIELD ? this.du : this.dv

            for (let i = 0; i < this.numParticles; i++) {
                const x = clamp(
                    this.particlePos[2 * i],
                    h,
                    (this.fNumX - 1) * h,
                    h
                )
                const y = clamp(
                    this.particlePos[2 * i + 1],
                    h,
                    (this.fNumY - 1) * h,
                    h
                )

                const x0 = Math.min(Math.floor((x - dx) * h1), this.fNumX - 2)
                const tx = (x - dx - x0 * h) * h1
                const x1 = Math.min(x0 + 1, this.fNumX - 2)

                const y0 = Math.min(Math.floor((y - dy) * h1), this.fNumY - 2)
                const ty = (y - dy - y0 * h) * h1
                const y1 = Math.min(y0 + 1, this.fNumY - 2)

                const sx = 1.0 - tx
                const sy = 1.0 - ty

                const d0 = sx * sy
                const d1 = tx * sy
                const d2 = tx * ty
                const d3 = sx * ty

                const nr0 = x0 * n + y0
                const nr1 = x1 * n + y0
                const nr2 = x1 * n + y1
                const nr3 = x0 * n + y1

                if (toGrid) {
                    const pv = this.particleVel[2 * i + component]
                    f[nr0] += pv * d0
                    acc[nr0] += d0
                    f[nr1] += pv * d1
                    acc[nr1] += d1
                    f[nr2] += pv * d2
                    acc[nr2] += d2
                    f[nr3] += pv * d3
                    acc[nr3] += d3
                } else {
                    // A face only carries usable velocity if a cell on one side
                    // of it holds fluid; sampling an all-air face drags the
                    // particle toward a number nothing ever wrote.
                    const offset = component === U_FIELD ? n : 1
                    const valid0 =
                        this.cellType[nr0] !== AIR_CELL ||
                        this.cellType[nr0 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid1 =
                        this.cellType[nr1] !== AIR_CELL ||
                        this.cellType[nr1 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid2 =
                        this.cellType[nr2] !== AIR_CELL ||
                        this.cellType[nr2 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid3 =
                        this.cellType[nr3] !== AIR_CELL ||
                        this.cellType[nr3 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0

                    const vOld = this.particleVel[2 * i + component]
                    const d =
                        valid0 * d0 + valid1 * d1 + valid2 * d2 + valid3 * d3

                    if (d > 0.0) {
                        const picV =
                            (valid0 * d0 * f[nr0] +
                                valid1 * d1 * f[nr1] +
                                valid2 * d2 * f[nr2] +
                                valid3 * d3 * f[nr3]) /
                            d
                        const corr =
                            (valid0 * d0 * (f[nr0] - prevF[nr0]) +
                                valid1 * d1 * (f[nr1] - prevF[nr1]) +
                                valid2 * d2 * (f[nr2] - prevF[nr2]) +
                                valid3 * d3 * (f[nr3] - prevF[nr3])) /
                            d
                        const flipV = vOld + corr
                        this.particleVel[2 * i + component] =
                            (1.0 - flipRatio) * picV + flipRatio * flipV
                    }
                }
            }

            if (toGrid) {
                for (let i = 0; i < f.length; i++) {
                    if (acc[i] > 0.0) f[i] /= acc[i]
                }

                for (let i = 0; i < this.fNumX; i++) {
                    for (let j = 0; j < this.fNumY; j++) {
                        const solid = this.cellType[i * n + j] === SOLID_CELL
                        if (
                            solid ||
                            (i > 0 &&
                                this.cellType[(i - 1) * n + j] === SOLID_CELL)
                        )
                            this.u[i * n + j] = this.prevU[i * n + j]
                        if (
                            solid ||
                            (j > 0 &&
                                this.cellType[i * n + j - 1] === SOLID_CELL)
                        )
                            this.v[i * n + j] = this.prevV[i * n + j]
                    }
                }
            }
        }
    }

    solveIncompressibility(
        numIters,
        dt,
        overRelaxation
    ) {
        this.p.fill(0.0)
        this.prevU.set(this.u)
        this.prevV.set(this.v)

        const n = this.fNumY
        const cp = (this.density * this.h) / dt

        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 1; i < this.fNumX - 1; i++) {
                for (let j = 1; j < this.fNumY - 1; j++) {
                    if (this.cellType[i * n + j] !== FLUID_CELL) continue

                    const center = i * n + j
                    const left = (i - 1) * n + j
                    const right = (i + 1) * n + j
                    const bottom = i * n + j - 1
                    const top = i * n + j + 1

                    const sx0 = this.s[left]
                    const sx1 = this.s[right]
                    const sy0 = this.s[bottom]
                    const sy1 = this.s[top]
                    const s = sx0 + sx1 + sy0 + sy1
                    if (s === 0.0) continue

                    let div =
                        this.u[right] -
                        this.u[center] +
                        this.v[top] -
                        this.v[center]

                    // Particles clump slightly on every step; without pushing
                    // back on cells denser than rest, the pool slowly collapses
                    // into one thin dark band along the floor.
                    if (this.particleRestDensity > 0.0) {
                        const compression =
                            this.particleDensity[center] -
                            this.particleRestDensity
                        if (compression > 0.0) div -= compression
                    }

                    let p = -div / s
                    p *= overRelaxation
                    this.p[center] += cp * p

                    this.u[center] -= sx0 * p
                    this.u[right] += sx1 * p
                    this.v[center] -= sy0 * p
                    this.v[top] += sy1 * p
                }
            }
        }
    }

    /**
     * Density to brightness, as a fourfold triangle wave rather than a ramp.
     * A plain ramp gives an even grey sheet; folding it four times draws the
     * contour bands that make the surface read as moving water in type.
     */
    setBandedColor(cellNr, val, maxVal) {
        const v = Math.min(Math.max(val, 0), maxVal - 0.0001) / maxVal
        const m = 0.25
        const num = Math.floor(v / m)
        const s = (v - num * m) / m
        this.cellColor[3 * cellNr] = num === 0 || num === 2 ? s : 1.0 - s
    }

    updateCellColors() {
        this.cellColor.fill(0.0)
        for (let i = 0; i < this.fNumCells; i++) {
            if (this.cellType[i] === FLUID_CELL) {
                let d = this.particleDensity[i]
                if (this.particleRestDensity > 0.0)
                    d /= this.particleRestDensity
                this.setBandedColor(i, d, 2.0)
            }
        }
    }

    simulate(
        dt,
        gravity,
        flipRatio,
        stir
    ) {
        this.integrateParticles(dt, gravity)
        if (stir) this.stirParticles(stir)
        this.pushParticlesApart(PARTICLE_ITERS)
        this.handleWallCollisions()
        this.transferVelocities(true)
        this.updateParticleDensity()
        this.solveIncompressibility(PRESSURE_ITERS, dt, OVER_RELAXATION)
        this.transferVelocities(false, flipRatio)
        this.updateCellColors()
    }
}

function createTank(cols, rows, depthCells, opening) {
    const h = SIM_HEIGHT / rows
    const tankWidth = h * cols

    const r = 0.3 * h
    const dx = 2.0 * r
    const dy = (Math.sqrt(3.0) / 2.0) * dx

    const numX = Math.floor((tankWidth - 2.0 * h - 2.0 * r) / dx)
    // drawRows omits the bottom wall and crop. Put the top particle row at
    // the shoulder's character cell above that visible floor.
    const surfaceY = (CROP_Y + 1 + depthCells) * h
    const numY = 1 + Math.round((surfaceY - (h + r)) / dy)
    if (numX <= 0 || numY <= 0) return null

    // Vary the number of rows per column so the opening crests are already
    // visible in the first frame, without stretching the particle spacing.
    const amplitude = opening ? Math.min(depthCells * 0.42, 5) * h / dy : 0
    const f = new FlipFluid(1000.0, tankWidth, SIM_HEIGHT, h, r, numX * (numY + Math.ceil(amplitude)))

    let p = 0
    const xOffset = (tankWidth - numX * dx) / 2
    for (let i = 0; i < numX; i++) {
        const phase = 2 * Math.PI * (i + 0.5) / numX
        const swell = 0.68 * Math.cos(3 * phase) + 0.32 * Math.sin(5 * phase)
        const columnRows = Math.round(numY + amplitude * swell)
        for (let j = 0; j < columnRows; j++) {
            // Rows staggered by half a spacing: a square lattice settles
            // into visible columns and the surface reads as corduroy.
            f.particlePos[p++] =
                h + r + dx * i + (j % 2 === 0 ? 0.0 : r) + xOffset
            f.particlePos[p++] = h + r + dy * j
        }
    }
    f.numParticles = p / 2
    if (opening) {
        for (const fraction of [0.32, 0.65, 0.94]) {
            f.splashParticles(tankWidth * fraction, surfaceY - h,
                Math.min(settings.radius * 1.6, (depthCells + 1) * h), settings.clickPush)
        }
    }

    const n = f.fNumY
    for (let i = 0; i < f.fNumX; i++) {
        for (let j = 0; j < f.fNumY; j++) {
            f.s[i * n + j] =
                i === 0 || i === f.fNumX - 1 || j === 0 ? 0.0 : 1.0
        }
    }

    return f
}

function drawRows(f) {
    const rows = []
    for (let i = f.fNumY - CROP_Y; i > CROP_Y; i--) {
        let row = ""
        for (let j = CROP_X; j < f.fNumX - CROP_X; j++) {
            const dict = DICTS[(i + j + 1) % DICTS.length]
            const c = f.cellColor[3 * (j * f.fNumY + i)]
            const k = Math.floor(c * dict.length)
            row += dict[Math.min(dict.length - 1, Math.max(0, k))]
        }
        rows.push(row)
    }
    return rows.join("\n")
}

let fluid = null
let timer = null
let visible = false
let still = false
let previous = null
let brush = null
let lastFrame = 0
const framePeriod = 1000 / 30

function frame() {
    timer = null
    if (!visible || !fluid) return
    const now = performance.now()
    if (brush) {
        const decay = Math.exp(-Math.min(0.1, (now - lastFrame) / 1000) * 10)
        brush.vx *= decay
        brush.vy *= decay
        if (Math.hypot(brush.vx, brush.vy) < STIR_MIN_SPEED) brush = null
    }
    lastFrame = now
    // Let a fresh particle lattice settle before freezing the reduced-motion view.
    const steps = still && fluid.particleRestDensity === 0 ? 8 : 1
    for (let i = 0; i < steps; i++) fluid.simulate(settings.dt, GRAVITY, settings.flipRatio, brush)
    self.postMessage(drawRows(fluid))
    if (!still) timer = setTimeout(frame, Math.max(0, framePeriod - (performance.now() - now)))
}

self.onmessage = ({data}) => {
    if (data.type === "resize") {
        fluid = createTank(data.cols + 2 * CROP_X, data.rows + 2 * CROP_Y, data.depthCells, !fluid)
        previous = brush = null
        if (visible && timer === null) frame()
        return
    }
    if (data.type === "visibility") {
        visible = data.visible
        still = data.still
        clearTimeout(timer)
        timer = previous = brush = null
        if (visible) frame()
        return
    }
    if (data.type === "leave") {
        previous = brush = null
        return
    }
    if (!visible || still || !fluid) return
    const x = (CROP_X + data.x) * fluid.h
    const y = (fluid.fNumY - CROP_Y - data.y) * fluid.h
    if (data.type === "press") {
        fluid.splashParticles(x, y, settings.radius * 1.6, settings.clickPush)
    } else if (data.type === "move") {
        if (previous) {
            const elapsed = Math.max(0.008, (data.time - previous.time) / 1000)
            brush = {
                x, y, r: settings.radius, strength: settings.push,
                vx: clamp((x - previous.x) / elapsed, -STIR_MAX_SPEED, STIR_MAX_SPEED, 0),
                vy: clamp((y - previous.y) / elapsed, -STIR_MAX_SPEED, STIR_MAX_SPEED, 0),
            }
        }
        previous = {x, y, time: data.time}
    }
}
