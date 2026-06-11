const canvas = document.getElementById('canvas')
const pen = canvas.getContext('2d')
let mode = 'hex'

let frozen = false
let mouseX = 0
let mouseY = 0

let sigma = 1000
let radius = 600
let starAngle = 0.5

let hexagons = []
canvas.width = window.innerWidth
canvas.height= window.innerHeight

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

window.addEventListener("contextmenu", function(e){
    e.preventDefault()
    frozen=!frozen
    document.getElementById("freezeBtn").textContent=frozen ? 'Unfreeze': "Freeze"
})

document.getElementById('toggle').addEventListener('click', function(){
    mode = mode ==='hex' ? 'star' : 'hex'
    this.textContent = mode === 'hex' ? 'Mode: Hex' : 'Mode: Star'
})

document.getElementById('sigmaSlider').addEventListener('input', function(){
    sigma = parseFloat(this.value)
    document.getElementById('sigmaVal').textContent = this.value
})

document.getElementById('radiusSlider').addEventListener('input', function(){
    radius = parseFloat(this.value)
    document.getElementById('radiusVal').textContent = this.value
})

document.getElementById('starSlider').addEventListener('input', function() {
    starAngle = parseFloat(this.value)/100
    document.getElementById('starVal').textContent = (starAngle).toFixed(2)

})

document.getElementById('colorPicker').addEventListener('input', function(){
    surfaceColor = this.value
})

document.getElementById('exportBtn').addEventListener('click', exportSVG)

document.getElementById('freezeBtn').addEventListener('click', function(){
    frozen = !frozen
    this.textContent = frozen ?' ▶️ Unfreeze' : '❄️ Freeze'
})

let surfaceColor = 'rgb(0, 0, 0)'


canvas.addEventListener('mousemove', function(e){
    const rect = canvas.getBoundingClientRect()
    mouseX=e.clientX - rect.left
    mouseY=e.clientY - rect.top }
)
function drawStarHex(cx, cy, radius, d){
    const corners=[]
    for (let i = 0; i<6; i++){
        const angle = (Math.PI /180) * (60 * i - 30)
        corners.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        })
    }
    const mids = []
    for (let i=0; i<6; i++){
        const a =corners[i]
        const b =corners[(i+1)%6]

        const mx = (a.x + b.x)/2
        const my = (a.y + b.y)/2
        
        const dx = cx - mx
        const dy = cy - my

        const dist = Math.sqrt(dx * dx + dy * dy)
        mids.push({
            x: mx + (dx/dist)*d,
            y: my + (dy/dist)*d
        })
    }

    const points =[]
    for (let i=0; i<6; i++){
        points.push(corners[i])
        points.push(mids[i])
    }
    pen.beginPath()
    pen.moveTo(points[0].x, points[0].y)
    for (let i=1 ; i<points.length; i++){
        pen.lineTo(points[i].x, points[i].y)
    }
    pen.strokeStyle = 'rgb(0, 0, 0)'
    pen.lineWidth = 5
    pen.fillStyle =  'rgb(79, 79, 91)'
    pen.closePath()
    pen.stroke()
    pen.fill()
    }

function drawHexagon(cx, cy, radius){
    const dx = cx - mouseX
    const dy = cy - mouseY
    const dist = Math.sqrt(dx * dx  + dy * dy)
    const falloff = Math.exp(-(dist * dist)/(2* sigma * sigma))

    if (mode==='star'){
        const maxD = radius + Math.sqrt(3)/2*0.9
        const d = Math.min(maxD, Math.max(radius*0.1, falloff * radius* starAngle))
        pen.beginPath()
        drawStarHex(cx, cy, radius, d)
    } else {


    const scale = Math.min(1, Math.max(0.1, 1-falloff * 0.9))
    const scaledRadius = radius * scale
    pen.strokeStyle = 'rgb(255, 255, 255)'
    pen.lineWidth = 10
    pen.beginPath()
    //pen.fill()
    pen.fillStyle = 'hsl(244, 33%, 42%)'

    
    for(let i=0; i<6 ; i++){
        const angle = (Math.PI / 180) * (60 * i - 30)
        const x = cx + scaledRadius * Math.cos(angle)
        const y = cy + scaledRadius * Math.sin(angle)
        if (i === 0 ) pen.moveTo(x,y)
        else pen.lineTo(x, y)
    }


    pen.closePath()
    pen.stroke()
    //const alpha = (1 - scale) * 0.95
    //pen.fillStyle = `rgba(230, 211, 42, ${alpha})`
    pen.fill()
    //drawStar(cx, cy, scaledRadius*0.9, 0.65)
    }
}
function drawGrid(cols, rows, radius){
    const spacingX = radius * Math.sqrt(3)
    const spacingY = radius * 1.5
    hexagons = []

    for (let row = 0; row <rows; row++){
        for (let col = 0; col<cols; col ++){
            const offset = (row % 2)*(spacingX/2)
            const x =col * spacingX+offset
            const y =row * spacingY

            const dx = x- mouseX
            const dy = y- mouseY

            const dist = Math.sqrt (dx * dx + dy * dy)
            const falloff = Math.exp(-(dist*dist)/(2*sigma*sigma))
            const scale = Math.min(1, Math.max(0.1, 1-falloff*0.9))
            const scaledRadius=radius*scale
            
            const maxD = scaledRadius * Math.sqrt(3)/2 * 0.9

            const d = Math.min(maxD, Math.max(radius * 0.1, falloff * radius * starAngle))
            hexagons.push({ cx: x, cy: y, r:scaledRadius, d:d})

            drawHexagon(x, y, radius, mode)
        }
    }
}

    

function exportSVG(){
    // const spacingX = radius * Math.sqrt(3)
    // const spacingY = radius * 1.5
    // const cols = Math.ceil(canvas.width / spacingX) + 1
    // const rows = Math.ceil(canvas.height / spacingY) + 1

    let paths = ''
    for (const hex of hexagons){
        
        let d= ''
        if (mode == 'star'){
            const corners = []
            for (let i=0; i<=6; i++){
                const angle =(Math.PI/180)*(60*i-30)
                corners.push({
                    x: hex.cx + hex.r * Math.cos(angle),
                    y: hex.cy + hex.r * Math.sin(angle)
                })
            }
            const mids = []
            for (let i=0; i<6; i++){
                const a = corners[i]
                const b = corners[(i+1)%6]
                const mx=(a.x + b.x)/2
                const my=(a.y+b.y)/2
                const ddx = hex.cx-mx
                const ddy=hex.cy-my
                const dist =Math.sqrt(ddx*ddx + ddy*ddy)
                mids.push({
                    x: mx + (ddx/dist)*hex.d,
                    y: my + (ddy/dist)*hex.d
                })
            }
            const points = []
            for (let i=0; i<6; i++){
                points.push(corners[i])
                points.push(mids[i])
            }
            for (let i=0; i<points.length; i++){
                d += i === 0 ? `M ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
                            :  `L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
                
                }
                d += 'Z'
            
        }
        else {
        for (let i=0; i<6; i++){
            const angle = (Math.PI/180)*(60*i-30)
            const x = (hex.cx + hex.r * Math.cos(angle)).toFixed(2)
            const y = (hex.cy + hex.r * Math.sin(angle)).toFixed(2)
            d += i === 0? `M ${x} ${y}` : `L ${x} ${y}`
        }
        d+= 'Z'
    }
        paths += `<path d="${d}" fill="white" fill-rule="nonzero" />\n`
    }

    
    // for (let row = 0; row < rows ; row ++){
    //     // for (let col = 0; col<cols; col ++){
    //     //     const offset = (row%2)*(spacingX/2)
    //     //     const cx = col * spacingX + offset
    //     //     const cy = row * spacingY

    const exportScale = 0.5
    const svg = `<svg xmlns= "http://www.w3.org/2000/svg" width="${canvas.width*exportScale}" height="${canvas.height*exportScale}" viewBox ="0 0 ${canvas.width} ${canvas.height}">
    <rect width ="100%" height ="100%" fill ="rgb(248,23, 90)"/>
    ${paths}</svg>`
    const blob =  new Blob([svg], { type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url
    a.download = 'the-double-skin.svg'
    a.click()
    URL.revokeObjectURL(url)
}

function animate() {
    if (!frozen){
        pen.clearRect(0, 0, canvas.width, canvas.height)
    pen.fillStyle = surfaceColor
    pen.fillRect(0, 0, canvas.width, canvas.height)

    //necessary to cut the hexagonal part
    pen.globalCompositeOperation = 'destination-out'
    //const sizeGrid=50
    const cols = Math.ceil(canvas.width / (radius * Math.sqrt(3))) + 1
    const rows = Math.ceil(canvas.height / (radius * 1.5)) + 1

    drawGrid(cols, rows, radius)

    pen.globalCompositeOperation = 'source-over'
    //pen.fillStyle='rgb(239, 182, 182)'
    pen.strokeStyle='rgb(25, 5, 147)'
    drawGrid(cols, rows, radius)
    
    }
    requestAnimationFrame(animate)
}
animate()