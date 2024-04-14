// 21130482_LeBaPhung_0336677141_DH21DTC
/**CONSTANT */
const COLS = 20;
const ROWS = 10;
const BLOCK_SIZE = 40;
// image data set source: https://www.kaggle.com/datasets/hlrhegemony/pokemon-image-dataset
const imgs = [
    "images/pokemon-set/1.jpg",
    "images/pokemon-set/2.jpg",
    "images/pokemon-set/3.jpg",
    "images/pokemon-set/4.jpg",
    "images/pokemon-set/5.jpg",
    "images/pokemon-set/6.jpg",
    "images/pokemon-set/7.jpg",
    "images/pokemon-set/8.jpg",
    "images/pokemon-set/9.jpg",
    "images/pokemon-set/10.jpg",
    "images/pokemon-set/11.jpg",
    "images/pokemon-set/12.jpg",
    "images/pokemon-set/13.jpg",
    "images/pokemon-set/14.jpg",
    "images/pokemon-set/15.jpg",
    "images/pokemon-set/16.jpg",
    "images/pokemon-set/17.jpg",
    "images/pokemon-set/18.jpg",
    "images/pokemon-set/19.jpg",
    "images/pokemon-set/20.jpg",
    "images/pokemon-set/21.jpg",
    "images/pokemon-set/22.jpg",
    "images/pokemon-set/23.jpg",
    "images/pokemon-set/24.jpg",
    "images/pokemon-set/25.jpg",
    "images/pokemon-set/26.jpg",
    "images/pokemon-set/27.jpg",
];
// pokemonMap: lưu key = id của 1 pokemon và value = ảnh tương ứng, giá trị bắt đầu = 1;
let pokemonMap = new Map();
for (let i = 0; i < imgs.length; i++) {
    pokemonMap.set(i + 1, imgs[i]);
}
// positions: lưu pokemon tương ứng với 1 ô, e.g: <1-1, 3>
let positions = new Map();
let isGameOver = false;
// canvas
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

// Board class
class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.generateWhiteBoard();
        this.positions = positions;
        this.first_Pos_Row = null;
        this.first_Pos_Col = null;
        this.last_Pos_Row = null;
        this.last_Pos_Col = null;
    }

    // generateWhiteBoard function: tạo mảng hai chiều rỗng, dựa theo hằng số ROWS, COLS đã khai báo trước
    generateWhiteBoard() {
        return Array.from({length: ROWS}, () => Array(COLS).fill());
    }

    // drawCell function: dựa vào id của thẻ pokemon sẽ vẽ image lên 1 ô hoặc vẽ viền cho board(vièn giới hạn)
    drawCell(xAxis, yAxis, pokemonId) {
        if (xAxis !== 0 && xAxis !== COLS - 1 && yAxis !== 0 && yAxis !== ROWS - 1) {
            this.positions.set(xAxis + "-" + yAxis, pokemonId);
            this.drawImage(xAxis, yAxis, pokemonId)
        } else {
            this.positions.set(xAxis + "-" + yAxis, null);
            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        }
    }

    // drawImage function: vẽ image lên 1 ô
    drawImage(xAxis, yAxis, pokemonId) {
        let img = new Image();
        img.src = pokemonMap.get(pokemonId); // Lấy đường dẫn từ pokemonMap
        img.onload = () => {
            this.ctx.drawImage(
                img,
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
            this.drawBorder(xAxis, yAxis, "green", 3);
        };
    }

    // drawBorder function: vẽ viền của 1 ô
    drawBorder(xAxis, yAxis, color, lineWidth) {
        // Vẽ border cho 1 ô
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }

    // drawLine function: vẽ đường nối khi 2 thẻ được chọn biến mất
    drawLine(xAxis_1, yAxis_1, xAxis_2, yAxis_2) {
        // Tính toán tọa độ điểm bắt đầu và điểm kết thúc của đường nối
        const startX = xAxis_1 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const startY = yAxis_1 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const endX = xAxis_2 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const endY = yAxis_2 * BLOCK_SIZE + BLOCK_SIZE / 2;

        // Bắt đầu vẽ đường nối
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY); // Đưa ngòi bút đến điểm bắt đầu
        this.ctx.lineTo(endX, endY); // Vẽ đường từ điểm bắt đầu đến điểm kết thúc
        this.ctx.strokeStyle = "red"; // Màu của đường nối (có thể thay đổi)
        this.ctx.lineWidth = 2; // Độ dày của đường nối (có thể thay đổi)
        this.ctx.stroke(); // Hiển thị đường nối
    }

    drawLines(point) {
        let arr1 = []
        let arr2 = []
        let arr3 = []
        let endPoint = null;
        let p = point
        while (p !== null) {
            if (p.zigzag === 2) {
                arr1.push(p)
            } else if (p.zigzag === 1) {
                arr2.push(p)
            } else if (p.zigzag === 0) {
                arr3.push(p)
            }
            p = p.parent_Point;
        }
        if (arr1.length > 0) {
            this.drawLine(arr1[0].x, arr1[0].y, arr2[0].x, arr2[0].y)
            this.drawLine(arr2[0].x, arr2[0].y, arr3[0].x, arr3[0].y)
            this.drawLine(arr3[0].x, arr3[0].y, arr3[arr3.length - 1].x, arr3[arr3.length - 1].y)
        } else if (arr2.length > 0) {
            this.drawLine(arr2[0].x, arr2[0].y, arr3[0].x, arr3[0].y)
            this.drawLine(arr3[0].x, arr3[0].y, arr3[arr3.length - 1].x, arr3[arr3.length - 1].y)
        } else if (arr3.length > 0) {
            this.drawLine(arr3[0].x, arr3[0].y, arr3[arr3.length - 1].x, arr3[arr3.length - 1].y)
        }
        // Sau 1 giây, xóa đường nối + xóa ô
        setTimeout(() => {
            this.drawEmpty(point.x, point.y);
            this.drawEmpty(arr3[arr3.length - 1].x, arr3[arr3.length - 1].y);
        }, 500);
    }

    // drawEmpty function: tô màu 1 ô
    drawEmpty(xAxis, yAxis) {
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }

    removePokemon(first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col) {
        //     delete id in  pokemon positions
        positions.set(first_Pos_Row + "-" + first_Pos_Col, null)
        positions.set(last_Pos_Row + "-" + last_Pos_Col, null)
        //     line
        // this.drawLine(first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col);
    }

    // choiceId function: xử lý khi 1 ô được chọn (click)
    choiceId(xAxis, yAxis) {
        if (isGameOver !== true) {
            if (positions.get(xAxis + "-" + yAxis) != null) {
                if (this.first_Pos_Row == null && this.first_Pos_Col == null) {
                    this.first_Pos_Row = xAxis;
                    this.first_Pos_Col = yAxis;
                    this.drawBorder(this.first_Pos_Row, this.first_Pos_Col, 'red', 2)
                } else {
                    this.last_Pos_Row = xAxis;
                    this.last_Pos_Col = yAxis;
                    if ((this.first_Pos_Row !== xAxis || this.first_Pos_Col !== yAxis) && positions.get(this.first_Pos_Row + "-" + this.first_Pos_Col) ===
                        positions.get(this.last_Pos_Row + "-" + this.last_Pos_Col)) {
                        let dfs = checkPathBFS(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col)
                        console.log("check dfs: ", dfs === null ? "no path" : dfs)
                        if (dfs != null) {
                            this.removePokemon(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col);
                            this.drawLines(dfs)
                        }
                    }
                    this.drawBorder(this.first_Pos_Row, this.first_Pos_Col, 'green', 3)
                    this.drawBorder(this.last_Pos_Row, this.last_Pos_Col, 'green', 3)

                    this.first_Pos_Row = null;
                    this.first_Pos_Col = null;
                    this.last_Pos_Row = null;
                    this.last_Pos_Col = null;
                }
                console.log(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col)
            }
        }
    }

    drawBoard() {
        const totalCells = COLS * ROWS;
        const pokemonCount = totalCells / 2; // Số lượng thẻ Pokémon cần xuất hiện trên bản đồ
        const pokemonIds = this.generateRandomPokemonIds(pokemonCount); // Tạo một mảng chứa các ID ngẫu nhiên của các thẻ Pokémon
        const pokemonPairs = pokemonIds.concat(pokemonIds); // Mỗi thẻ Pokémon cần có một thẻ khác để kết hợp với nó
        const shuffledPairs = this.shuffleArray(pokemonPairs); // Trộn ngẫu nhiên các cặp thẻ Pokémon

        let index = 0;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const pokemonId = shuffledPairs[index]; // Lấy ID của thẻ Pokémon tại vị trí hiện tại trong mảng đã trộn
                this.drawCell(col, row, pokemonId); // Vẽ thẻ Pokémon vào ô tương ứng
                index++;
            }
        }
    }

    generateRandomPokemonIds(count) {
        const randomIds = [];
        for (let i = 0; i < count; i++) {
            randomIds.push(randomPokemonId()); // Thêm một ID Pokémon ngẫu nhiên vào mảng
        }
        return randomIds;
    }

    shuffleArray(array) {
        // Thuật toán trộn mảng Fisher-Yates
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

class Point {
    constructor(x, y, zigzag) {
        this.x = x;
        this.y = y;
        this.parent_Point = null;
        this.zigzag = zigzag;
    }

    toString() {
        return "[" + this.x + ", " + this.y + ", " + this.zigzag + "]";
    }
}

function getChild(currentPoint, x_end, y_end) {
    let list = []
    let childPoint;
    if (currentPoint.zigzag < 3) {
        let p1 = new Point(currentPoint.x - 1, currentPoint.y + 0, 0);
        let p2 = new Point(currentPoint.x + 1, currentPoint.y + 0, 0);
        let p3 = new Point(currentPoint.x + 0, currentPoint.y - 1, 0);
        let p4 = new Point(currentPoint.x + 0, currentPoint.y + 1, 0);

        if (positions.get(p1.x + "-" + p1.y) === null || p1.x === x_end && p1.y === y_end) {
            p1.parent_Point = currentPoint
            setZigzag(p1)
            if (p1.zigzag <= 2) {
                list.push(p1)
            }
        }
        if (positions.get(p2.x + "-" + p2.y) === null || p2.x === x_end && p2.y === y_end) {
            p2.parent_Point = currentPoint
            setZigzag(p2)
            if (p2.zigzag <= 2) {
                list.push(p2)
            }
        }

        if (positions.get(p3.x + "-" + p3.y) === null || p3.x === x_end && p3.y === y_end) {
            p3.parent_Point = currentPoint
            setZigzag(p3)
            if (p3.zigzag <= 2) {
                list.push(p3)
            }
        }
        if (positions.get(p4.x + "-" + p4.y) === null || p4.x === x_end && p4.y === y_end) {
            p4.parent_Point = currentPoint
            setZigzag(p4)
            if (p4.zigzag <= 2) {
                list.push(p4)
            }
        }
    }
    return list;
}

function setZigzag(point) {
    if (point.parent_Point === null) {
        point.zigzag = 0;
    } else if (point.parent_Point.parent_Point === null) {
        point.zigzag = 0;
    } else {
        let x1 = point.x;
        let y1 = point.y;
        let x2 = point.parent_Point.x;
        let y2 = point.parent_Point.y;
        let x3 = point.parent_Point.parent_Point.x;
        let y3 = point.parent_Point.parent_Point.y;
        if (x1 === x2 && x2 === x3 || y1 === y2 && y2 === y3) {
            point.zigzag = point.parent_Point.zigzag;
        } else {
            point.zigzag = point.parent_Point.zigzag + 1;
        }
    }
}

function checkPathBFS(x_start, y_start, x_end, y_end) {

    if (getChild(new Point(x_end, y_end, 0), x_end, y_end) === null) {
        return null;
    }

    let queue = []//chua dinh dang xet
    let currentPoint = new Point(x_start, y_start, 0);
    queue.push(currentPoint)
    let minDistance = Number.MAX_SAFE_INTEGER;
    let visited = []
    while (queue.length > 0) {
        console.log("size: ", queue.length)
        currentPoint = queue.shift()
        visited.push(currentPoint)
        if (currentPoint.parent_Point !== null) {
            console.log("currentPoint: ", currentPoint.x, currentPoint.y, currentPoint.zigzag, "parent: ", currentPoint.parent_Point.x, currentPoint.parent_Point.y, currentPoint.parent_Point.zigzag)
        } else {
            console.log("currentPoint: ", currentPoint.x, currentPoint.y, currentPoint.zigzag, "null")
        }
        if (currentPoint.x === x_end && currentPoint.y === y_end) {
            return currentPoint;
        } else {
            let childPoints = getChild(currentPoint, x_end, y_end)
            for (let i = 0; i < childPoints.length; i++) {
                let e = childPoints[i];
                if (!queue.some(child => child.x === e.x && child.y === e.y && child.zigzag !== e.zigzag
                        && child.parent_Point.zigzag === e.parent_Point.zigzag)
                    && !visited.some(child => child.x === e.x && child.y === e.y && child.zigzag === e.zigzag
                        && child.parent_Point.zigzag === e.parent_Point.zigzag
                        && child.parent_Point.x === e.parent_Point.x
                        && child.parent_Point.y === e.parent_Point.y)
                ) {
                    if (e.x === x_end && e.y === y_end) {
                        queue.unshift(e)
                    } else {
                        queue.push(e);
                        // ưu tiên kc gần hơn
                        queue.sort((a, b) => (
                            Math.sqrt((Math.pow(a.x - x_end, 2) + Math.pow(a.y - y_end, 2)))
                            -
                            Math.sqrt((Math.pow(b.x - x_end, 2) + Math.pow(b.y - y_end, 2)))
                        ));
                    }
                }
            }
        }
    }
    return null;
}

// randomPokemonId function: trả về ngẫu nhiên id của pokemon
function randomPokemonId() {
    return parseInt(Math.random() * imgs.length) + 1;
}

// Khởi tạo giao diện chưa bắt đầu chơi
board = new Board(ctx);
// P
board.drawImage(1, 7, randomPokemonId())
board.drawImage(1, 6, randomPokemonId());
board.drawImage(1, 5, randomPokemonId())
board.drawImage(1, 4, randomPokemonId());
board.drawImage(1, 3, randomPokemonId())
board.drawImage(2, 3, randomPokemonId())
board.drawImage(3, 3, randomPokemonId())
board.drawImage(3, 4, randomPokemonId())
board.drawImage(3, 5, randomPokemonId())
board.drawImage(3, 3, randomPokemonId())
board.drawImage(2, 5, randomPokemonId())
// b

board.drawImage(5, 3, randomPokemonId())
board.drawImage(5, 4, randomPokemonId())
board.drawImage(5, 5, randomPokemonId())
board.drawImage(5, 6, randomPokemonId())
board.drawImage(5, 7, randomPokemonId())
board.drawImage(6, 5, randomPokemonId())
board.drawImage(7, 5, randomPokemonId())
board.drawImage(7, 6, randomPokemonId())
board.drawImage(7, 7, randomPokemonId())
board.drawImage(6, 7, randomPokemonId())
// l
board.drawImage(9, 3, randomPokemonId())
board.drawImage(9, 4, randomPokemonId())
board.drawImage(9, 5, randomPokemonId())
board.drawImage(9, 6, randomPokemonId())
board.drawImage(9, 7, randomPokemonId())
// u
board.drawImage(11, 5, randomPokemonId())
board.drawImage(11, 6, randomPokemonId())
board.drawImage(11, 7, randomPokemonId())
board.drawImage(12, 7, randomPokemonId())
board.drawImage(13, 7, randomPokemonId())
board.drawImage(13, 6, randomPokemonId())
board.drawImage(13, 5, randomPokemonId())
// e
board.drawImage(16, 3, randomPokemonId())
board.drawImage(17, 3, randomPokemonId())
board.drawImage(15, 3, randomPokemonId())
board.drawImage(15, 4, randomPokemonId())
board.drawImage(15, 5, randomPokemonId())
board.drawImage(16, 5, randomPokemonId())
board.drawImage(17, 5, randomPokemonId())
board.drawImage(15, 6, randomPokemonId())
board.drawImage(15, 7, randomPokemonId())
board.drawImage(16, 7, randomPokemonId())
board.drawImage(17, 7, randomPokemonId())

// coundown function: đếm ngược thơi gian
let number = 10 * 60;
const timeline = document.getElementById("timeline");
const init_timeline_width = timeline.offsetWidth;

function coundown() {
    number--;
    if (number !== 0) {
        document.getElementById("timer").innerHTML = parseInt(number / 60) + ":" + (number % 60);
        const newWidth = (number / (60)) * init_timeline_width;
        document.getElementById("timeline").style.width = 90 + '%';
        // console.log(init_timeline_width, timeline.offsetWidth, newWidth)

        setTimeout("coundown()", 1000);
    } else {
        document.getElementById("timer").innerHTML = "Game Over";
        playBtn.innerHTML = "Re Play"
        number = 10 * 60;
        isGameOver = true;
    }
}

// Xử lý khi click button 'plau-btn' (bắt đầu trò chơi)
const playBtn = document.getElementById('play-btn');
playBtn.addEventListener('click', function () {
    board = new Board(ctx);
    board.drawBoard();
    isGameOver = false;
    coundown();
    canvas.addEventListener("click", function (event) {
        // ô được click
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const cellX = Math.floor(clickX / BLOCK_SIZE);
        const cellY = Math.floor(clickY / BLOCK_SIZE);
        // Ghi log Id của ô được click
        console.log("Clicked on cell:  " + cellX + " - " + cellY + ": " + positions.get(cellX + "-" + cellY));
        board.choiceId(cellX, cellY);
    });
});
