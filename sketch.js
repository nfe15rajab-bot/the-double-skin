const canvas = document.getElementById('canvas')
const pen = canvas.getContext('2d')
let mode = 'hex'

let frozen = false
let mouseX = 0
let mouseY = 0

let sigma = 500
let radius = 150
let starAngle = 0.5

let solarMode = false 
let attractorX=0
let attractorY=0

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

document.getElementById('solarModeBtn').addEventListener('click', function(){
    solarMode=!solarMode
    this.textContent=solarMode ? 'Solar Mode:On':'Solar Mode:Off'
    this.style.background=solarMode?'rgba(251, 146, 60, 0.4)' : 'rgba(255, 255, 255, 0.1)'
})

let surfaceColor = 'rgb(255, 255, 255)'


canvas.addEventListener('mousemove', function(e){
    const rect = canvas.getBoundingClientRect()
    if (!solarMode){
        attractorX=e.clientX - rect.left
        attractorY=e.clientY - rect.top 
    }
    
})
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
    pen.strokeStyle = 'rgb(255, 255, 255)'
    pen.lineWidth = 5
    pen.fillStyle =  'rgba(123, 123, 123, 0.09)'
    pen.closePath()
    pen.stroke()
    pen.fill()
    }

function drawHexagon(cx, cy, radius){
    const dx = cx - attractorX
    const dy = cy - attractorY
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

            const dx = x- attractorX
            const dy = y- attractorY

            const dist = Math.sqrt (dx * dx + dy * dy)
            const falloff = Math.exp(-(dist*dist)/(2*sigma*sigma))
            const scale = Math.min(1, Math.max(0.1, 1-falloff*0.9))
            const scaledRadius=radius*scale
            
            const maxD = radius * Math.sqrt(3)/2 * 0.9

            const d = Math.min(maxD, Math.max(radius * 0.1, falloff * radius * starAngle))
            hexagons.push({ cx: x, cy: y, r: mode ==='hex' ? scaledRadius : radius, d:d})

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
            for (let i=0; i<6; i++){
                const angle =(Math.PI/180)*(60*i-30)
                corners.push({
                    x: hex.cx + radius * Math.cos(angle),
                    y: hex.cy + radius * Math.sin(angle)
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

    const exportScale = 0.67
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

function drawSunArc(lat, lng, date, altitude, azimuth){
    const arcCanvas  = document.getElementById('sunArc')
    const ctx = arcCanvas.getContext('2d')
    const w = arcCanvas.width
    const h = arcCanvas.height
    
    ctx.clearRect(0, 0, w, h)

    //background
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0,0,w,h)


    //horizon line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h * 0.75)
    ctx.lineTo(w, h * 0.75)
    ctx.stroke()


    //sun arc 
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    let first = true
    for (let h24=0; h24 <= 24; h24++){
        const d = new Date(date)
        d.setHours(h24, 0 , 0 , 0)
        const pos = SunCalc.getPosition(d, lat, lng)
        const alt=pos.altitude * 180/Math.PI
        const az=(pos.azimuth*180/Math.PI + 180)
        const x = (az/360)*w
        const y = h*0.75 - (alt/90) * h * 0.7
        if (first){ ctx.moveTo(x, y); first = false}
        else ctx.lineTo(x , y)
    }
    ctx.stroke()

    //current sun position
    if (altitude>0){
        const x = (azimuth/360)*w
        const y = h * 0.75 - (altitude/90)*h*0.7
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#fbbf24'
        ctx.fill()
    }
}

// document.getElementById('hourSlider').addEventListener('input', updateSolar)
// document.getElementById('dateInput').addEventListener('input', updateSolar)
// document.getElementById('latInput').addEventListener('input', updateSolar)
// document.getElementById('lngInput').addEventListener('input', updateSolar)
// document.getElementById('scaleSlider').addEventListener('input', updateSolar)
document.getElementById('calculateBtn').addEventListener('click', updateSolar)
document.getElementById('hourSlider').addEventListener('input', function(){
    document.getElementById('hourVal').textContent=this.value
})

function updateSolar(){
    const lat=parseFloat(document.getElementById('latInput').value)
    const lng=parseFloat(document.getElementById('lngInput').value)
    const hour=parseInt(document.getElementById('hourSlider').value)
    const dateVal=document.getElementById('dateInput').value
    const scale = parseFloat(document.getElementById('scaleSlider').value)
    const date = dateVal? new Date(dateVal):new Date()
    date.setHours(hour, 0, 0, 0)

    const sunPos= SunCalc.getPosition(date, lat, lng)
    const altitude=(sunPos.altitude*180/Math.PI).toFixed(1)
    const azimuth=((sunPos.azimuth*180/Math.PI)+180).toFixed(1)

    document.getElementById('outAltitude').textContent=altitude
    document.getElementById('outAzimuth').textContent=azimuth
    document.getElementById('hourVal').textContent=hour
    document.getElementById('scaleVal').textContent=scale


    //void ratio calculations
    // const totalArea = canvas.width * canvas.height
    // const pxToMm=scale
    // const totalAreaMm = totalArea * pxToMm * pxToMm
    // const openingPx = hexagons.reduce((sum, hex)=> {
    //     if (mode === 'star') {
    //         const hexArea = (3 * Math.sqrt(3)/2)*hex.r*hex.r
    //         const triangleArea = 0.5*hex.r*hex.d * Math.sin(Math.PI/3)
    //         return sum + hexArea - 6 * triangleArea

    //     } else {
    //         return sum + (3 * Math.sqrt(3)/2)*hex.r*hex.r
    //     }

    // }, 0)

        
        
    // const openingMm2 = openingPx * pxToMm * pxToMm
    // const voidRatio= Math.min(100,(openingPx/totalArea * 100)).toFixed(1)
    // const openingCm2=(openingMm2/100).toFixed(1)
//void ratio updated

    const spacingX=radius * Math.sqrt(3)
    const spacingY=radius * 1.5
    const cellAreaPx = spacingX * spacingY
    const hexAreaPx=(3*Math.sqrt(3)/2)*radius*radius
    // const voidRatioPerCell = Math.PI * Math.sqrt(3) / 6

    const openingPx = hexagons.reduce((sum, hex) => {
        return sum + (3 * Math.sqrt(3)/2)*hex.r * hex.r
    }, 0)
    const totalArea = canvas.width * canvas.height
    const voidRatioPerCell = Math.min(0.907, openingPx/totalArea)
    const voidRatio = (voidRatioPerCell*100).toFixed(1)

    const pxToMm = scale
    const openingAreaMm2 = openingPx *pxToMm * pxToMm
    const openingCm2 = (openingAreaMm2/100).toFixed(1)

    const cols = Math.ceil(canvas.width/spacingX) + 1
    const rows = Math.ceil(canvas.height/spacingY) + 1
    const totalCells = cols * rows

    // const pxToMm = scale
    // const totalPanelAreaMm2 = totalCells * cellAreaPx * pxToMm *pxToMm
    // const openingAreaMm2 = totalPanelAreaMm2 * voidRatioPerCell
    // const openingCm2 = (openingAreaMm2 / 100).toFixed(1)
    //const voidRatio = (voidRatioPerCell * 100).toFixed(1)

    const altRad = sunPos.altitude
    const irradiance = altRad>0 ? (1000*Math.sin(altRad)*(voidRatio/100)).toFixed(1):0
    document.getElementById('outVoid').textContent=voidRatio
    document.getElementById('outArea').textContent=openingCm2
    document.getElementById('outIrradiance').textContent=irradiance

    drawSunArc(lat, lng, date, parseFloat(altitude), parseFloat(azimuth))

    const sunAzimuthDeg = (sunPos.azimuth * 180/Math.PI) + 180
    const sunAltitudeDeg = sunPos.altitude * 180 / Math.PI

    if (solarMode && sunAltitudeDeg >0){
        attractorX = (sunAzimuthDeg/360)*canvas.width
        attractorY =canvas.height - (sunAltitudeDeg/90)*canvas.height
    } else if(solarMode) {
        attractorX = -9999
        attractorY = -9999
    }
}

document.getElementById('exportJSON').addEventListener('click', function(){
    const data = {
        timestamp:new Date().toISOString(),
        location :{
            latitude: parseFloat(document.getElementById('latInput').value),
            longitude: parseFloat(document.getElementById('lngInput').value)
        },
        solar : {
            altitude: document.getElementById('outAltitude').textContent,
            azimuth: document.getElementById('outAzimuth').textContent
        },
        pattern : {
            mode: mode,
            radius: radius,
            sigma:sigma, 
            voidRatio:document.getElementById('outVoid').textContent,
            openingAreaCm2: document.getElementById('outArea').textContent,
            irradianceWm2: document.getElementById('outIrradiance').textContent
        }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'the-double-skin-data.json'
    a.click()
    URL.revokeObjectURL(url)
})
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
updateSolar()