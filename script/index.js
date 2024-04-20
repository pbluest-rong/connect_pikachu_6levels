/*
21130482_LeBaPhung_0336677141_DH21DTC

source code: https://github.com/pbluest-rong/connect-pikachu-game
Từ khóa: x là thứ dòng của ô, y là thứ cột của y
 */
const COLS = 16 + 2;
const ROWS = 8 + 2;
const BLOCK_SIZE = 55;
const TIME = 10 * 60 + 1;
const SECOND_COUNTER_ADD_POKEMON = 30+ 1;//15s nếu ko click đúng 2 ô thì thêm 2 hoặc 4 pokemon
let CHANGE_NUMBER = 5;
let LEVEL = 1;
let board;
//countdownTimeout: sử dụng để hủy và bắt đầu tiến trình đếm thời gian khi play/replay trò chơi
let countdownTimeout;
// WALL_NUMBER: số lượng ô WALL; dùng cho level 2 trở lên
let WALL_NUMBER = 8;
// BALL_NUMBER: số lượng ô BALL; dùng cho level 4 trở lên
const BALL_NUMBER = 6;
// ballId: là Id của một pokemon bất kỳ trên bản đồ, dùng để vẽ Ball đè lên hình ảnh của pokemon đó
let ballId;
// XballPostions: là mảng chứa các thứ dòng của các Ball
let XballPostions = []//e.g. [x1,x2,x3,x4]
// XballPostions: là mảng chứa các thứ cột của các Ball
let YballPostions = []//e.g. [y1,y2,y3,y4]
// Nguồn image data set: https://www.kaggle.com/datasets/hlrhegemony/pokemon-image-dataset
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
// pokemonMap: key là id của 1 pokemon và value là ảnh tương ứng, giá trị bắt đầu = 1;
let pokemonMap = new Map();
for (let i = 0; i < imgs.length; i++) {
    pokemonMap.set(i + 1, imgs[i]);
}
// positions: lưu vị trí pokemon tương ứng với 1 ô
// Key là x-y, value là pokemon id tương ứng trong pokemonMap variable
// e.g. ô có x là 1 và y là 1 chứa pokemon id là 3 thì giá trị tương ứng trong positions là <1-1, 3>
let positions = new Map();
// isGameOver: khi hết thời gian hoặc người chơi thắng cuộc thì isGameOver có giá trị là true. Ngược lại, isGameOver có giá trị là false
let isGameOver = false;
/*
 trueChoiceCounter:
 Thay vì duyệt qua tất cả các ô để biết người chơi đã thắng.
 Biến trueChoiceCounter sẽ thay đổi phù hợp
 Vượt qua trò chơi khi giá trị trueChoiceCounter bằng số ô mà pokemon id tương ứng trong positions khác null và khác undefined.
 Giá trị ban đầu là 0
 */
let trueChoiceCounter = 0;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

/*
 Board class:
 # class kết hợp với canvas tạo ra bản đồ cho trò chơi
 */
class Board {
    constructor(ctx) {
        // ctx: biến canvas
        this.ctx = ctx;
        // grid: tạo mảng hai chiều rỗng
        this.grid = this.generateWhiteBoard();
        // posittions: lưu vị trí pokemon tương ứng với ô trong canvas
        this.positions = positions;
        // first_Pos_Row: nhằm lưu trữ thứ tự dòng của ô thứ nhất đã chọn
        this.first_Pos_Row = null;
        // first_Pos_Col: nhằm lưu trữ thứ tự côt của ô thứ nhất đã chọn
        this.first_Pos_Col = null;
        // last_Pos_Row: nhằm lưu trữ thứ tự dòng của ô thứ hai đã chọn
        this.last_Pos_Row = null;
        // last_Pos_Col: nhằm lưu trữ thứ tự cột của ô thứ hai đã chọn
        this.last_Pos_Col = null;
    }

    /*
     generateWhiteBoard function: tạo mảng hai chiều rỗng, dựa theo hằng số ROWS, COLS đã khai báo trước
     */
    generateWhiteBoard() {
        return Array.from({length: ROWS}, () => Array(COLS).fill());
    }

    /*
     drawCell function: dựa vào id của thẻ pokemon sẽ vẽ image lên 1 ô hoặc vẽ viền cho board(giới hạn)
     # khi function này được thực hiện, thông qua positions thì các ô sẽ được gán với id của pokemon,nếu các ô viền sẽ được gán là null
     */
    drawCell(xAxis, yAxis, pokemonId) {
        if (xAxis !== 0 && xAxis !== COLS - 1 && yAxis !== 0 && yAxis !== ROWS - 1) {
            this.positions.set(xAxis + "-" + yAxis, pokemonId);
            if (pokemonId === null) {
                this.drawEmpty(xAxis, yAxis)
            } else if (pokemonId === undefined) {
                console.log("okee")
                this.drawWall(xAxis, yAxis);
            } else {
                this.drawImage(xAxis, yAxis, pokemonId)
            }
        } else {
            this.positions.set(xAxis + "-" + yAxis, null);
            this.drawEmpty(xAxis, yAxis)
        }
    }

    /*
    drawWall function: vẽ ô WALL trên bản đồ, đồng thời ô đó sẽ được gán undefined trong positions
     */
    drawWall(xAxis, yAxis) {
        this.positions.set(xAxis + "-" + yAxis, undefined);
        let img = new Image();
        img.src = 'images/pokemon-set/wall.jpg'; // Lấy đường dẫn từ pokemonMap
        img.onload = () => {
            this.ctx.drawImage(
                img,
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        };
    }

    drawBall(xAxis, yAxis) {
        let img = new Image();
        img.src = "images/pokemon-set/ball.jpg"; // Lấy đường dẫn từ pokemonMap
        img.onload = () => {
            this.ctx.drawImage(
                img,
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        };
    }

    drawBallList() {
        // Vẽ ball
        XballPostions = []
        YballPostions = []
        for (let row = 1; row < ROWS - 1; row++) {
            for (let col = 1; col < COLS - 1; col++) {
                if (positions.get(col + '-' + row) === ballId) {
                    XballPostions.push(col);
                    YballPostions.push(row);
                }
            }
        }
        for (let i = 0; i < XballPostions.length; i++) {
            let x = XballPostions[i];
            let y = YballPostions[i]
            this.drawBall(x, y)
        }
    }

    // drawImage function: vẽ image lên 1 ô
    drawImage(xAxis, yAxis, pokemonId) {
        let path = pokemonMap.get(pokemonId);
        if (path !== undefined) {
            let img = new Image();
            img.src = path; // Lấy đường dẫn từ pokemonMap
            img.onload = () => {
                this.ctx.drawImage(
                    img,
                    xAxis * BLOCK_SIZE,
                    yAxis * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            };
        }
    }

    // drawLine function: vẽ đường nối khi 2 ô
    drawLine(xAxis_1, yAxis_1, xAxis_2, yAxis_2) {
        // Tính toán tọa độ điểm bắt đầu và điểm kết thúc của đường nối
        const startX = xAxis_1 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const startY = yAxis_1 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const endX = xAxis_2 * BLOCK_SIZE + BLOCK_SIZE / 2;
        const endY = yAxis_2 * BLOCK_SIZE + BLOCK_SIZE / 2;
        // Vẽ đường nối
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /*
     drawLines function: tham số truyền vào là kết quả tìm được đường đi của 2 ô (Point).
     # Dựa vào giá trị parent, sẽ vẽ được các đường nối bằng drawLines function.
     # Sau khi vẽ các đường nối. Sau 0.5s thì xóa ô trên bản đồ bằng drawEmpty function
     */
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
        // Sau 0.5 giây, xóa đường nối + xóa ô
        setTimeout(() => {
            for (let i = 0; i < arr1.length; i++) {
                this.drawEmpty(arr1[i].x, arr1[i].y);
            }
            for (let i = 0; i < arr2.length; i++) {
                this.drawEmpty(arr2[i].x, arr2[i].y);
            }
            for (let i = 0; i < arr3.length; i++) {
                this.drawEmpty(arr3[i].x, arr3[i].y);
            }
        }, 500);
    }

    // drawEmpty function: xóa 1 ô trên bản đồ
    drawEmpty(xAxis, yAxis) {
        this.ctx.clearRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }

    /*
    drawChoice function: làm mờ ô khi ô đó được chọn
     */
    drawChoice(xAxis, yAxis) {
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        this.ctx.globalAlpha = 1;
    }

    drawBorder(xAxis, yAxis) {
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }

    /*
    removePokemon function: thay đổi giá trị của ô trong positions là null. Điều này thể hiện ô đó có thể thông qua
     */
    removePokemon(first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col) {
        positions.set(first_Pos_Row + "-" + first_Pos_Col, null)
        positions.set(last_Pos_Row + "-" + last_Pos_Col, null)
    }

    /*
    choiceId function: xử lý khi 1 ô được chọn (click)
     */
    choiceId(xAxis, yAxis) {
        // Kiểm tra trạng thái game. Nếu isGameOver là false thì tiếp tục trò chơi
        if (isGameOver !== true) {
            // Xử lý ô được chọn có giá trị pokemonId là null hay không. Nếu ô được chọn có giá trị không null thì tiếp tục xử lý
            if (positions.get(xAxis + "-" + yAxis) != null) {
                // Xử lý sự kiện người chơi chọn ô đầu tiên:
                // gán giá trị cho first_Pos_Row và first_Pos_Col
                if (this.first_Pos_Row == null && this.first_Pos_Col == null) {
                    this.first_Pos_Row = xAxis;
                    this.first_Pos_Col = yAxis;
                    this.drawChoice(this.first_Pos_Row, this.first_Pos_Col)
                }
                    // Xử lý sự kiện người chơi chọn ô thứ hai:
                // Gán giá trị cho last_Pos_Row và last_Pos_Col
                else {
                    this.last_Pos_Row = xAxis;
                    this.last_Pos_Col = yAxis;
                    this.drawChoice(this.last_Pos_Row, this.last_Pos_Col)
                    // Điều kiện là vị trí 2 ô được chọn khác nhau và pokemonId giống nhau
                    if ((this.first_Pos_Row !== xAxis || this.first_Pos_Col !== yAxis) && positions.get(this.first_Pos_Row + "-" + this.first_Pos_Col) ===
                        positions.get(this.last_Pos_Row + "-" + this.last_Pos_Col)) {
                        // Sử dụng thuật toán để tìm đường đi
                        let dfs = checkPathBFS(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col)
                        console.log("check dfs: ", dfs === null ? "no path" : dfs)
                        // Xử lý kết quả đường đi thu được
                        if (dfs != null) {
                            trueChoiceCounter += 2;
                            // LEVEL: CHECK GAME OVER
                            if (LEVEL === 1 && trueChoiceCounter === (ROWS - 2) * (COLS - 2)
                                || LEVEL >= 2 && trueChoiceCounter === (ROWS - 2) * (COLS - 2) - WALL_NUMBER) {
                                isGameOver = true;
                            }
                            this.removePokemon(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col);
                            this.drawLines(dfs)
                            // level 4: phải xử lý trước level 3, vì gặp th ô trên ball bị xóa -> chưa kịp đóng băng thì nó nhảy xuống trước
                            if (LEVEL >= 4) {
                                if (checkBallPoint(this.first_Pos_Row, this.first_Pos_Col) !== null && checkBallPoint(this.last_Pos_Row, this.last_Pos_Col) !== null) {
                                    this.removeRandomPokemon(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col);
                                    // remove ball positions
                                    let FirstBallIndex = checkBallPoint(this.first_Pos_Row, this.first_Pos_Col);
                                    let SecondBallIndex = checkBallPoint(this.last_Pos_Row, this.last_Pos_Col);
                                    if (FirstBallIndex !== null) {
                                        console.log("deleted ball 1", FirstBallIndex)
                                        XballPostions.splice(FirstBallIndex, 1)
                                        YballPostions.splice(FirstBallIndex, 1)
                                    }
                                    if (SecondBallIndex !== null) {
                                        if (FirstBallIndex < SecondBallIndex) {
                                            console.log("deleted ball 2", SecondBallIndex)
                                            XballPostions.splice(SecondBallIndex - 1, 1);
                                            YballPostions.splice(SecondBallIndex - 1, 1)
                                        } else {
                                            console.log("deleted ball 2", SecondBallIndex)
                                            XballPostions.splice(SecondBallIndex, 1);
                                            YballPostions.splice(SecondBallIndex, 1)
                                        }
                                    }
                                }
                                if(LEVEL === 5){
                                    timer = SECOND_COUNTER_ADD_POKEMON;
                                }
                            }
                            //     level 3:
                            if (LEVEL >= 3 && LEVEL !== 6) {
                                this.handleLevel3(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col);
                            }
                            if (LEVEL >= 6) {
                                setTimeout(() => {
                                    board.moveToOneCellReload()
                                }, 600)
                            }
                        }
                    }
                    // Thiết lập lại giá trị first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col
                    if (checkBallPoint(this.first_Pos_Row, this.first_Pos_Col) !== null) {
                        //     ball
                        this.drawBall(this.first_Pos_Row, this.first_Pos_Col)
                    } else {
                        this.drawImage(this.first_Pos_Row, this.first_Pos_Col, positions.get(this.first_Pos_Row + "-" + this.first_Pos_Col))
                    }
                    if (checkBallPoint(this.last_Pos_Row, this.last_Pos_Col) !== null) {
                        //     ball
                        this.drawBall(this.last_Pos_Row, this.last_Pos_Col)
                    } else {
                        this.drawImage(this.last_Pos_Row, this.last_Pos_Col, positions.get(this.last_Pos_Row + "-" + this.last_Pos_Col))
                    }

                    this.first_Pos_Row = null;
                    this.first_Pos_Col = null;
                    this.last_Pos_Row = null;
                    this.last_Pos_Col = null;
                }
                console.log(this.first_Pos_Row, this.first_Pos_Col, this.last_Pos_Row, this.last_Pos_Col)
            }
        }
    }

    handleLevel3(first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col) {
        if (LEVEL >= 3) {
            if (first_Pos_Row !== last_Pos_Row) {
                // Nếu first_Pos_Row khác last_Pos_Row
                if (first_Pos_Row < last_Pos_Row) {
                    this.fellToGround(first_Pos_Row, first_Pos_Col, 600);
                    this.fellToGround(last_Pos_Row, last_Pos_Col, 650);
                } else {
                    this.fellToGround(last_Pos_Row, last_Pos_Col, 600);
                    this.fellToGround(first_Pos_Row, first_Pos_Col, 650);
                }
            } else {
                // Nếu first_Pos_Row bằng last_Pos_Row
                if (first_Pos_Col < last_Pos_Col) {
                    this.fellToGround(first_Pos_Row, first_Pos_Col, 600);
                    this.fellToGround(last_Pos_Row, last_Pos_Col, 650);
                } else {
                    this.fellToGround(last_Pos_Row, last_Pos_Col, 600);
                    this.fellToGround(first_Pos_Row, first_Pos_Col, 650);
                }
            }
        }
    }

    fellToGround(x, y, time) {
        setTimeout(() => {
            if (this.positions.get(x + '-' + y) === null) {
                for (let i = y - 1; i > 0; i--) {
                    let id = this.positions.get(x + '-' + i);
                    if (id === undefined) {
                        break;
                    } else if (id !== null && this.positions.get(x + '-' + (i + 1)) === null) {
                        this.positions.set(x + '-' + (i + 1), id);
                        this.positions.set(x + '-' + i, null);
                        this.drawCell(x, (i + 1), id)
                        this.drawCell(x, i, null)
                        let checkBall = checkBallPoint(x, i);
                        if (checkBall !== null) {
                            YballPostions[checkBall] = i + 1;
                            this.drawBall(x, i + 1)
                        }
                    }
                }
            }
        }, time)
    }

    removeRandomPokemon(first_Pos_Row, first_Pos_Col, last_Pos_Row, last_Pos_Col) {
        //    random pokemonId trong map
        let number = Math.floor(Math.random() * 6) + 1;
        let x = Math.floor(COLS / number)
        let y = Math.floor(ROWS / number)
        let pokemonId = positions.get(x + '-' + y)

        // 2 ô xóa phải cùng id, không là ball, không là wall, không là first, last
        while (pokemonId === null || pokemonId === undefined
        || checkBallPoint(x, y) !== null
        || (x === first_Pos_Row && y === first_Pos_Col)
        || (x === last_Pos_Row && y === last_Pos_Col)) {
            if (checkBallPoint(x, y) !== null) {
                number = Math.floor(Math.random() * 6) + 1;
                x = Math.floor(COLS / number)
                y = Math.floor(ROWS / number)
                pokemonId = positions.get(x + '-' + y)
            }
            if ((x === first_Pos_Row && y === first_Pos_Col)
                || (x === last_Pos_Row && y === last_Pos_Col)) {
                number = Math.floor(Math.random() * 6) + 1;
                x = Math.floor(COLS / number)
                y = Math.floor(ROWS / number)
                pokemonId = positions.get(x + '-' + y)
            }
            if (pokemonId === null || pokemonId === undefined) {
                pokemonId = randomPokemonId();
            }
        }

        console.log("ball? ", checkBallPoint(x, y))

        // luu cac pos cung id
        let XSameIdPositions = []
        let YSameIdPositions = []
        for (let row = 1; row < ROWS - 1; row++) {
            for (let col = 1; col < COLS - 1; col++) {
                if (positions.get(col + '-' + row) === pokemonId) {
                    XSameIdPositions.push(col);
                    YSameIdPositions.push(row);
                }
            }
        }
        // set null + ve lai:
        let i = 0;
        let x1 = XSameIdPositions[i];
        let y1 = YSameIdPositions[i];
        let x2 = XSameIdPositions[XSameIdPositions.length - 1];
        let y2 = YSameIdPositions[XSameIdPositions.length - 1];
        // console.log("arr same remove Id Size", XSameIdPositions)
        // console.log("removed Id Two Pokemon 1: ", pokemonId, i, x1,y1, positions.get(x1 + '-' + y1))
        // console.log("removed Id Two Pokemon 2: ", pokemonId, i, x2,y2, positions.get(x2 + '-' + y2))

        // hiệu ứng
        this.drawChoice(x1, y1)
        this.drawChoice(x2, y2)
        // null + vẽ lại
        if (XSameIdPositions.length >= 2) {
            setTimeout(() => {
                WALL_NUMBER += 2;
                this.positions.set(x1 + '-' + y1, null);
                this.positions.set(x2 + '-' + y2, null);
                // có thể drawEmpty, drawWall, fellToGround
                this.drawWall(x1, y1)
                // có thể drawEmpty, drawWall, fellToGround
                this.drawWall(x2, y2)
            }, 600)
        }
    }

    addRandomPokemon() {
        let XNullIdPositions = []
        let YNullIdPositions = []
        for (let row = 1; row < ROWS - 1; row++) {
            for (let col = 1; col < COLS - 1; col++) {
                if (positions.get(col + '-' + row) === null) {
                    XNullIdPositions.push(col);
                    YNullIdPositions.push(row);
                }
            }
        }
        if (XNullIdPositions.length >= 2) {
            if (XNullIdPositions.length <= 6) {
                let pokemonId = randomNotNullNotUndefinedPokemonId();//cần xử lý ko null, ko wall, ko đc cùng id
                this.drawCell(XNullIdPositions[0], YNullIdPositions[0], pokemonId)
                this.drawCell(XNullIdPositions[XNullIdPositions.length - 1], YNullIdPositions[YNullIdPositions.length - 1], pokemonId)
                trueChoiceCounter -= 2;
            } else {
                let pokemonId = randomNotNullNotUndefinedPokemonId();
                this.drawCell(XNullIdPositions[0], YNullIdPositions[0], pokemonId)
                this.drawCell(XNullIdPositions[XNullIdPositions.length - 1], YNullIdPositions[YNullIdPositions.length - 1], pokemonId)
                console.log("1: ", pokemonId, XNullIdPositions[0], YNullIdPositions[0], XNullIdPositions[XNullIdPositions.length - 1], YNullIdPositions[YNullIdPositions.length - 1])

                let tempArr = XNullIdPositions;
                let index1 = Math.floor(Math.random() * tempArr.length - 2) + 1;
                tempArr.splice(index1, 1)
                let index2 = Math.floor(Math.random() * tempArr.length - 2) + 1;
                pokemonId = randomNotNullNotUndefinedPokemonId();
                this.drawCell(XNullIdPositions[index1], YNullIdPositions[index1], pokemonId)
                this.drawCell(XNullIdPositions[index2], YNullIdPositions[index2], pokemonId)
                console.log("2: ", pokemonId, XNullIdPositions[index1], YNullIdPositions[index1], XNullIdPositions[index2], YNullIdPositions[index2])
                trueChoiceCounter -= 4;
            }
        }
    }

    /*
     drawBoardLevel1 function: Khởi tạo bản đồ ngẫu nhiên pokemon ở cấp level 1
     */
    drawBasicBoard() {
        document.getElementById("chance-counter").innerHTML = CHANGE_NUMBER;
        showButtonForGame();
        let size = (COLS - 2) * (ROWS - 2)//chan
        let idList = []
        const options = [2, 4]

        if (size % 2 === 0) {
            console.log("size: ", size)
            let id, option;
            while (idList.length < size) {
                id = randomPokemonId()
                option = options[Math.floor(Math.random() * options.length)]
                for (let i = 0; i < option; i++) {
                    if (idList.length < size) {
                        idList.push(id)
                    }
                }
            }
            console.log("ids: ", idList.length)
            // trộn mảng
            for (let i = idList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [idList[i], idList[j]] = [idList[j], idList[i]];
            }
            // lưu vị trí vào pokemonMap và vẽ trên canvas
            let index = 0;
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (row !== 0 && row !== ROWS - 1 && col !== 0 && col !== COLS - 1) {
                        // console.log("check: ", idList[index], index)
                        let pokemonId = idList[index];
                        // level 1
                        this.drawCell(col, row, pokemonId);
                        index++;
                    } else {
                        this.drawCell(col, row, null);
                    }
                }
            }
            console.log("final: ", index)
        }
    }

    /*
        drawBoardLevel2 function: Khởi tạo bản đồ ngẫu nhiên pokemon ở cấp level 2.
        # Xuất hiện các ô WALL
    */
    drawWallBoard() {
        document.getElementById("chance-counter").innerHTML = CHANGE_NUMBER;
        showButtonForGame();
        let size = (COLS - 2) * (ROWS - 2)//chan
        let idList = []
        const options = [2, 4]

        if (size % 2 === 0) {
            console.log("size: ", size)
            let id, option;
            while (idList.length < size - WALL_NUMBER) {
                id = randomPokemonId()
                option = options[Math.floor(Math.random() * options.length)]
                for (let i = 0; i < option; i++) {
                    if (idList.length < size) {
                        idList.push(id)
                    }
                }
            }
            // level 2
            for (let i = 0; i < WALL_NUMBER; i++) {
                idList.push(undefined)
            }

            console.log("ids: ", idList.length)
            // trộn mang
            for (let i = idList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [idList[i], idList[j]] = [idList[j], idList[i]];
            }
            // lưu vị trí vào pokemonMap và vẽ trên canvas
            let index = 0;
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (row !== 0 && row !== ROWS - 1 && col !== 0 && col !== COLS - 1) {
                        // console.log("check: ", idList[index], index)
                        let pokemonId = idList[index];
                        if (pokemonId === undefined) {
                            // level 2
                            this.drawWall(col, row);
                        } else {
                            // level 1
                            this.drawCell(col, row, pokemonId);
                        }
                        index++;
                    } else {
                        this.drawCell(col, row, null);
                    }
                }
            }
            console.log("final: ", index)
        }
    }

    drawWallBallBoard() {
        XballPostions = []
        YballPostions = []
        this.drawWallBoard();
        //     duyệt all cho tới khi ballPositions.leng = BALL_NUMBER-> 2 ô nào có id trùng nhau -> add vào ballPositions
        // random id => duyệt xem map có bao nhiêu trong arr = x,y,x,y,...
        // ballPositions = [arr[0],arr[1],arr[arr.length / 2],arr[arr.length/2 + 1],arr[arr.length-2], arr[arr.length-1]
        let x = Math.floor(COLS / 2)
        let y = Math.floor(ROWS / 2)
        ballId = positions.get(x + '-' + y)
        while (ballId === null || ballId === undefined) {
            ballId = randomPokemonId()
        }
        this.drawBallList()
    }

    /*
    change function: xáo trộn bản đồ pokemon hiện tại
     */
    change() {
        if (CHANGE_NUMBER > 0) {
            // Lấy danh sách các ô không là null và undefined trong positions
            let keys = Array.from(positions.keys()).filter(
                key => {
                    return positions.get(key) !== null
                        // level 2
                        && positions.get(key) !== undefined
                }
            );

            for (let i = 0; i < keys.length; i++) {
                // Chọn ngẫu nhiên 2 khóa từ danh sách
                let randomKeys = [];
                while (randomKeys.length < 2) {
                    let randomKey = keys[Math.floor(Math.random() * keys.length)];
                    if (!randomKeys.includes(randomKey)) {
                        randomKeys.push(randomKey);
                    }
                }
                // Lấy giá trị tương ứng với mỗi khóa
                let firstValue = positions.get(randomKeys[0])
                let lastValue = positions.get(randomKeys[1])
                // switch
                if (firstValue !== null && lastValue !== null) {
                    positions.set(randomKeys[0], lastValue)
                    positions.set(randomKeys[1], firstValue)
                }
            }
            // lưu vị trí vào pokemonMap và vẽ trên canvas
            keys = Array.from(positions.keys());

            let index = 0;
            while (index < keys.length) {
                let [x, y] = keys[index].split('-');
                if (positions.get(keys[index]) !== null && positions.get(keys[index]) !== undefined) {
                    this.drawCell(x, y, positions.get(keys[index]))
                }
                index++;
            }
            if (LEVEL !== 6 && LEVEL >= 4) {
                this.drawBallList()
            }
            // giảm 1 đơn vị của CHANGE_NUMBER
            CHANGE_NUMBER -= 1;
            document.getElementById("chance-counter").innerHTML = CHANGE_NUMBER;
        }
    }

    moveToOneCellReload() {
        let startId, tempId;
        for (let j = 1; j < ROWS - 1; j++) {
            for (let i = 1; i < COLS - 1; i++) {
                if (i === 1 && j === 1) {
                    startId = positions.get(i + '-' + j);
                } else {
                    startId = tempId;
                }

                console.log("startId", startId)
                if (i < COLS - 2) {
                    if (i === 1) {
                        tempId = positions.get(i + '-' + j);
                        // hiệu ứng
                        if (i % 2 === 1) {
                            this.drawChoice(i, j)
                        }
                        if(i===1 && j===1){
                            this.drawCell(i, j, null);
                        }else{
                            this.drawCell(i, j, startId);
                        }
                        startId = tempId;
                        tempId = positions.get((i + 1) + '-' + j);
                        console.log("temp final: ", tempId)
                        // hiệu ứng
                        if (i % 2 === 1) {
                            this.drawChoice(i + 1, j)
                        }
                        this.drawCell(i + 1, j, startId);
                    } else {
                        tempId = positions.get((i + 1) + '-' + j);
                        console.log("temp final: ", tempId)
                        // hiệu ứng
                        if (i % 2 === 1) {
                            this.drawChoice(i + 1, j)
                        }
                        this.drawCell(i + 1, j, startId);
                    }
                }
                if (i === COLS - 2 && j === ROWS - 2) {
                    //     vẽ lại  ô đầu 1,1
                    this.drawCell(1, 1, startId)
                    // if(positions.get(1+'-'+1)===null){
                    //     this.drawEmpty(1,1, null);
                    //     console.log("check check")
                    // }
                }
                // tempId = undefined => startId không thể assign tempId
                if(tempId === undefined){
                    startId = undefined;
                }
            }
        }
    }
}

/*
 Point class: 1 point sẽ tương ứng 1 ô để dễ xử lý logic thuật toán tìm đường nối 2 ô
 */
class Point {
    constructor(x, y, zigzag) {
        // + x, y: vị trí trên canvas
        this.x = x;
        this.y = y;
        //  + parent_Point: dùng để lưu Point cha khi tìm đường đi của thuật toán tìm đường đi
        this.parent_Point = null;
        //  + zigzag: thể hiện số lần gấp khúc trên đường đi của thuật toán tìm đường đi
        this.zigzag = zigzag;
    }

    toString() {
        return "[" + this.x + ", " + this.y + ", " + this.zigzag + "]";
    }
}

/**
 * Trả về index trong mảng XballPostions, YballPostions
 * @param {number} x tương ứng dòng thứ
 * @param {number} y tương ứng cột thứ
 * @return {number} index nếu vị trí ô đó là Ball. Còn không null
 */
function checkBallPoint(x, y) {
    for (let i = 0; i < XballPostions.length; i++) {
        if (x === XballPostions[i] && y === YballPostions[i]) {
            return i;
        }
    }
    return null;
}

/**
 * Trả về danh sách các ô kề của một ô mà các ô có giá trị pokemonId là null hoặc là vị trí đích đến.
 * Điều kiện giá trị zigzag không vượt quá 3
 * @param currentPoint
 * @param x_end
 * @param y_end
 * @return {*[]}
 */
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

/**
 * Tìm và thay đổi giá trị zigzag dựa vào parentPoint của một Point
 * @param point
 */
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

/**
 Thuật toán tìm đường đi ngắn giữa 2 Point
 @param x_start giá trị x của điểm bắt đầu
 @param y_start giá trị y của điểm bắt đầu
 @param x_end giá trị x của điểm đến
 @param y_end giá trị y của điểm đến
 @return Point Nếu tìm được đường đi thì trả về điểm đến. Còn không, trả về null
 */
function checkPathBFS(x_start, y_start, x_end, y_end) {
    if (getChild(new Point(x_end, y_end, 0), x_end, y_end) === null) {
        return null;
    }
    let queue = []//chứa các Point chứa duyệt
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
                //
                if (
                    !queue.some(child => child.x === e.x && child.y === e.y && child.zigzag !== e.zigzag
                        && child.parent_Point.zigzag === e.parent_Point.zigzag)
                    && !visited.some(child => child.x === e.x && child.y === e.y && child.zigzag === e.zigzag
                        && child.parent_Point.zigzag === e.parent_Point.zigzag
                        && child.parent_Point.x === e.parent_Point.x
                        && child.parent_Point.y === e.parent_Point.y)
                ) {
                    // Nếu Point đang xét là điểm đến thì đưa vào đầu queue
                    if (e.x === x_end && e.y === y_end) {
                        queue.unshift(e)
                    } else {
                        // ưu tiên khoảng cách gần hơn so với điểm đến
                        queue.push(e);
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

/**
 * Trả về ngẫu nhiên id từ danh sách pokemonMap
 @return {number}
 */
function randomPokemonId() {
    let valuesArray = Array.from(pokemonMap.keys());
    return parseInt(Math.floor(Math.random() * valuesArray.length) + 1);
}

/**
 * Trả về ngẫu nhiên id không là nyll hoặc undefined từ danh sách pokemonMap
 * @return {number}
 */
function randomNotNullNotUndefinedPokemonId() {
    let valuesArray = Array.from(pokemonMap.keys());
    for (let i = 0; i < valuesArray.length; i++) {
        if (valuesArray[i] == null || valuesArray[i] === undefined) {
            valuesArray.splice(i, 1);
        }
    }
    return parseInt(Math.floor(Math.random() * valuesArray.length) + 1);
}

const playBtn = document.getElementById('play-btn');
const replayBtn = document.getElementById('replay-btn');
const levelBox = document.getElementById('level-box');
const changeBtn = document.getElementById('change-btn');

/**
 * Đếm ngược thời gian và xử lý của trò chơi
 */
let number = TIME;
let timer = SECOND_COUNTER_ADD_POKEMON;//90s tạo 1 add pokemon
function countdown() {
    number--;
    timer--;
    if (LEVEL === 5) {
        document.getElementById("clickTimer").innerHTML = timer;
        ;
        if (timer === 0) {
            board.addRandomPokemon();
            timer = SECOND_COUNTER_ADD_POKEMON;
        }
    }
    if (isGameOver === true) {
        document.getElementById("timer").innerHTML = "Congratulations";
        return false;
    }
    if (number > 0) {
        document.getElementById("timer").innerHTML = parseInt(number / 60) + ":" + (number % 60);
        countdownTimeout = setTimeout("countdown()", 1000);
    } else {
        isGameOver = true;
        document.getElementById("timer").innerHTML = "Game Over";
        return false;
    }
}

// Khởi tạo giao diện ban đầu
initGame()
// Xử lý sự kiện các button chơi và sự kiện click ô trong canvas
playBtn.addEventListener('click', function () {
    LEVEL = getChoiceLevel();
    // hủy time cũ
    if (countdownTimeout) {
        clearTimeout(countdownTimeout);
    }

    playBtn.disabled = true;
    playBtn.style.display = "none";
    levelBox.disabled = true;
    levelBox.style.display = "none";

    document.getElementById("title").innerHTML = "Connect Pikachu Game - Level: " + LEVEL;
    document.getElementsByTagName("body")[0].style.backgroundImage = "url('/images/bg2.jpg')";
    board = new Board(ctx);
    console.log(LEVEL)
    if (LEVEL === 2) {
        board.drawWallBoard();
    } else if (LEVEL === 3) {
        board.drawWallBoard();
    } else if (LEVEL === 4) {
        board.drawWallBallBoard();
    } else if (LEVEL === 5) {
        board.drawWallBallBoard();
    } else if (LEVEL === 6) {
        board.drawWallBoard();
    } else {
        board.drawBasicBoard();
    }
    isGameOver = false;
    countdown();
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
// Xử lý sự kiện các button xáo trộn bản đồ
changeBtn.addEventListener('click', function () {
    if (isGameOver === false) {
        board.change();
    }
})
// Xử lý sự kiện các button chơi lại màn trong trò chơi
replayBtn.addEventListener('click', function () {
    // default setting
    number = 0;
    number = TIME;
    CHANGE_NUMBER = 5;
    isGameOver = false;
    trueChoiceCounter = 0;
    if (LEVEL === 2) {
        board.drawWallBoard()
    } else if (LEVEL === 3) {
        board.drawWallBoard();
    } else if (LEVEL === 4) {
        board.drawWallBallBoard();
    } else if (LEVEL === 5) {
        board.drawWallBallBoard();
        timer = SECOND_COUNTER_ADD_POKEMON;
    } else if (LEVEL === 6) {
        board.drawWallBoard();
    } else {
        board.drawBasicBoard();
    }
});

// Khởi tạo giao diện chưa bắt đầu chơi
function initGame() {
    let board = new Board(ctx);
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
    return board
}

function showGuide() {
    document.getElementById("guide-box").style.display = 'block'
}

function hideGuide() {
    document.getElementById("guide-box").style.display = 'none'
}

function showInformation() {
    document.getElementById("information-box").style.display = 'block'
}

function hideInformation() {
    document.getElementById("information-box").style.display = 'none'
}

function exit() {
    // Sử dụng window.location để chuyển đến URL mới
    window.location.href = "index.html";
}

function showLink() {
    window.open("https://www.youtube.com/@pbluest_rong", "_blank");
}


function showButtonForGame() {
    document.getElementById("change-btn").style.display = 'block';
    document.getElementById("chance-counter").style.display = 'block';
    document.getElementById("exit-btn").style.display = 'block';
    document.getElementById("replay-btn").style.display = 'block';
    document.getElementById("infor-btn").style.display = 'none';
    document.getElementById("link-btn").style.display = 'none';
}

function getChoiceLevel() {
    let ele = document.getElementsByName('level');

    for (let i = 0; i < ele.length; i++) {
        if (ele[i].checked)
            return Number(ele[i].value);
    }
    return 1;
}