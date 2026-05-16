const canvas = document.getElementById('canvas')
const pen = canvas.getContext('2d')

let mouseX = 0
let mouseY = 0

canvas.addEventListener('mousemove', function(e){
    const rect = canvas.getBoundingClientRect()
    mouseX=e.clientX - rect.left
    mouseY=e.clientY - rect.top }
)

function drawHexagon(cx, cy, radius){
    const dx = cx - mouseX
    const dy = cy - mouseY
    const dist = Math.sqrt(dx * dx  + dy * dy)
    const sigma = 600
    const falloff = Math.exp(-(dist * dist)/(2* sigma * sigma))
    const scale = Math.min(1, Math.max(0.1, 1-falloff * 0.9))
    const scaledRadius = radius * scale
    pen.lineWidth = 0.5

    pen.beginPath()
            for(let i=0; i<6 ; i++){
                const angle = (Math.PI / 180) * (60 * i - 30)
                const x = cx + scaledRadius * Math.cos(angle)
                const y = cy + scaledRadius * Math.sin(angle)
                if (i === 0 ) pen.moveTo(x,y)
                else pen.lineTo(x, y)
    }


    pen.closePath()
    pen.stroke()
    const alpha = (1 - scale) * 0.95
    pen.fillStyle = `rgba(230, 211, 42, ${alpha})`
    pen.fill()
}
function drawGrid(cols, rows, radius){
    const spacingX = radius * Math.sqrt(3)
    const spacingY = radius * 1.5

    for (let row = 0; row <rows; row++){
        for (let col = 0; col<cols; col ++){
            const offset = (row % 2)*(spacingX/2)
            const x =col * spacingX+offset
            const y =row * spacingY
            drawHexagon(x, y, radius)
        }
    }
}
    

function animate() {
    pen.clearRect(0, 0, canvas.width, canvas.height)
    const sizeGrid=70
    drawGrid(sizeGrid, sizeGrid, sizeGrid)
    requestAnimationFrame(animate)
}
animate()