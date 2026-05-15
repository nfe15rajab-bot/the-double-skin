const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// ctx.beginPath()
// ctx.arc(300, 300, 50, 0, Math.PI * 2)
// ctx.stroke()

function drawHexagon(cx, cy, radius){
    ctx.beginPath()
    for (let i=0; i<6; i++){
        const angle = (Math.PI / 180) * (60 * i - 30)
        const x = cx + radius * Math.cos(angle)
        const y = cy + radius * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x,y)
    }
    ctx.closePath()
    ctx.stroke()

}   

// drawHexagon(300, 300, 80)

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
drawGrid(50,50,50)