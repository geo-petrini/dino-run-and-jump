

function initConfig(){
    console.log('sceneGame initialized')

    const config = {
        type: Phaser.auto,
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [ArenaGame],
        scale: {
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 3000
                },
                checkCollision: {
                    up: true,
                    down: false,
                    left: false,
                    right: true
                },
                debug: true
            }
        },
        parent: "gameDiv",
        dom: {
            createContainer: true
        },
        backgroundColor: 0xFFFFFF,
    };
    return config;
}

function leaderboard() {
    document.getElementById("game").style.display = "none";
    document.getElementById("leaderboard").style.display = "block";

    // TODO get player with the best score > 0
    // TODO assign the medal dino.assignMedal(medal)
    // TODO save score dino.saveScore()

    // var result = {};
    // diniNicknames.forEach((key, i) => result[key] = dini[i].score);

    // var items = Object.keys(result).map(function(key) {
    //     return [key, result[key]];
    // });

    // // Sort the array based on the second element
    // items.sort(function(first, second) {
    //     return second[1] - first[1];
    // });
    // // document.getElementById("restart").style.display = "block";
    // // document.getElementById("home").style.display = "block";
    // var table = document.getElementById("leader_table");
    // var medal = createMedal(0, 0, 100);
    // var i = 1;
    // for (const [key, value] of items) {
    //     var row = "";
    //     row += '<tr><th scope="row">' + i + '</th><td>' + key + '</td><td>' + value + '</td>';
    //     if (i == 1) {
    //         row += '<td><svg width="100px" height="100px">' + medal + '</svg></td>';
    //         if (!key.includes("guest")) {
    //             saveMedal(medal, key);
    //             saveScore(value, key);
    //         }
    //     } else {
    //         row += "<td></td>";
    //     }
    //     row += "</tr>"
    //     table.innerHTML += row;
    //     i++;
    // }
}

class ArenaGame extends Phaser.Scene {


    // Inizializzare costanti di gioco
    NUM_DINI = 0;
    NUM_GROUNDS = 3;
    NUM_MOUNTAINS = 10;
    NUM_CACTUS = 5;
    START_HEIGHT = 410;
    HEIGHT_SPACE = 30;
    START_DISTANCE_CACTUS = 900;
    START_DISTANCE_DINI = 240;
    TRANSLATION = 20;
    HEIGHT_CACTUS = 50;
    HEIGHT_DINI = 50;

    COLLISION_CHECK = false;

    // Inizializzare variabili di gioco
    grounds;
    mountains;
    cloud;

    dini;   //will be initialized as list conaining Dino instances
    cactus;
    colliderLines;

    minimumDistance;        //distance between cacti
    colliderDini;
    backgroundSpeed;        //this is the game speed and gets faster as the game progresses by updateDifficulty()
    score;
    cactusValidation;

    // var diniNicknames = [];
    childNum;
    // var diniJumps = [];
    // var diniColor = [];
    checkFirst = false;
    //#endregion

    infoText;

    // var uids = [];
    // game;   //instance of game
    runGame = false;

    preload(){
        this.initPlayerJoinListener()   // does not check for players already in game
        this.initSprites()
    }
    create(){
        this.initStartValues()
        this.initInfoText()
        this.initColliderLines();
        this.initGrounds();
        this.initMountains();
        this.initCloud();
        this.initCactus();
        this.initAnimations();
        this.initColliderCactusDini();        
    }
    update(time, delta){
        if (runGame){
            this.stopPlayerJoinListener()    // TODO verify if this should be moved in start()
            
            for(const dino in dini){
                dino.update()
            }
            updateGrounds();
            updateMountains();
            updateCactus();
            updateCloud();
            updateScore();
            checkEndOfGame();            
        } else {
            for(const dino in dini){
                dino.update()
            }         
        }
    }

    start(){
        this.runGame = true;
        this.restart();
    }

    end() {
        this.input.stopPropagation();
        leaderboard();      //external function
        this.scene.stop();
    }    

    initStartValues() {
        this.runGame = false;
        this.grounds = new Array(this.NUM_GROUNDS);
        this.mountains = new Array(this.NUM_MOUNTAINS);
        this.cloud;
        this.dini = new Array(this.NUM_DINI);
        this.cactus = new Array(this.NUM_DINI);
    
        for (var i = 0; i < this.cactus.length; i++) {
            this.cactus[i] = new Array(this.NUM_CACTUS);
        }
    
        this.colliderLines = [];
        this.minimumDistance = 260;
        this.colliderDini = new Array(this.NUM_DINI);
        this.backgroundSpeed = 3;
    
        this.cactusValidation = new Array(this.NUM_DINI);
        for (var i = 0; i < this.cactusValidation.length; i++) {
            this.cactusValidation[i] = new Array(this.NUM_CACTUS);
        }
    
        for (var i = 0; i < this.cactusValidation.length; i++) {
            for (var j = 0; j < this.cactusValidation[i].length; j++) {
                this.cactusValidation[i][j] = false;
            }
        }
    }  

    initInfoText(){
        this.infoText = this.add.text(10, 100, { color: '#F00' });
        this.infoText.setDepth( 9000 )        
    }
    
    initPlayerJoinListener(){
        db.ref(`session/${localStorage.getItem("sessionId")}/players`).on("child_added", function(snapshot) {
            db.ref(`session/${localStorage.getItem("sessionId")}/players`).once('value', function(sessionSnapshot) {
                childNum = sessionSnapshot.numChildren();
            });
        
            var playerId = snapshot.key
            var dino = new Dino(game, playerId, dini.length+1)
            this.dini.push(dino)
            this.scene.restart();
            console.log(`new player ${playerId} joined the game, restarting instance`)
        });        
    }

    initSprites(){
        this.load.image('ground', host + '../static/img/terreno3.png');
        this.load.image('mountains', host + '../static/img/montagne.png');
        this.load.image('cloud', host + '../static/img/nuvola.png');
        this.load.image('cactus', host + '../static/img/cactus.png');
        this.load.spritesheet('dinoSprite', host + '../static/img/dinoSprite.png', {
            frameWidth: 50,
            frameHeight: 52
        });           
    }


    initAnimations() {
        //animazione di corsa
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('dinoSprite', {
                start: 0,
                end: 1
            }),
            frameRate: 10,
            repeat: -1
        });
    
        //animazione di salto
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('dinoSprite', {
                start: 2,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        });
    
        //animazione di morte
        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNumbers('dinoSprite', {
                start: 3,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });
    }    

    initColliderCactusDini() {
        for (var i = 0; i < this.cactus.length; i++) {
            for (var j = 0; j < this.cactus[i].length; j++) {
                this.physics.add.overlap(this.dini[i], this.cactus[i][j], collideCactus, null, this);
            }
            console.log(`created cactus colliders for dino ${this.dini[i]}`)
        }
    }    

    initColliderLines() {
        this.colliderLines = this.physics.add.staticGroup();
    }    

    initGrounds() {
        var xPosition = 0;
        for (var i = 0; i < this.grounds.length; i++) {
            this.grounds[i] = this.physics.add.image(xPosition, 368, 'ground').setOrigin(0, 0);
            this.grounds[i].setImmovable(true); // fissa i terreni
            this.grounds[i].body.allowGravity = false; // toglie la gravità
            xPosition += 2000;  // width of a ground image
        }
    } 
    
    initMountains() {
        counter = 0;
        for (var i = 0; i < this.mountains.length; i++) {
            this.mountains[i] = this.physics.add.image(counter, 275, 'mountains').setOrigin(0, 0);
            this.mountains[i].setImmovable(true); //fissa le mountains
            this.mountains[i].body.allowGravity = false; // toglie la gravità
            counter += 408;
        }
    }   
    
    initCloud() {
        this.cloud = this.add.image(1200, 255, 'cloud').setOrigin(0, 0);
    }  
    
    initCactus() {

        for (var i = 0; i < this.cactus.length; i++) {
            for (var j = 0; j < cactus[i].length; j++) {
                var distance = Math.floor(Math.random() * 200) + 70;
                var x = 0;
                if (j == 0) {
                    x = this.START_DISTANCE_CACTUS + (i * this.TRANSLATION);
                } else if (i == 0) {
                    x = (cactus[i][j - 1]).x + this.minimumDistance + distance;
                } else {
                    x = cactus[i - 1][j].x + this.TRANSLATION;
                }
                this.cactus[i][j] = game.physics.add.image(x, this.START_HEIGHT + (i * this.HEIGHT_SPACE) - this.HEIGHT_CACTUS, 'cactus').setOrigin(0, 0);
                this.cactus[i][j].setImmovable(true);
                this.cactus[i][j].body.allowGravity = false;
            }
        }
    }    

    stopPlayerJoinListener(){
        db.ref("session/" + localStorage.getItem("sessionId")).off("child_added", function(snapshot) {
            // game.scene.restart();
        });        
    }

    collideCactus(dino) {
        if (this.COLLISION_CHECK){
            dino.die()
        } else {
            console.log(`detected collision for dino ${dino}`)
        }
    }    

    updateGrounds() {
        //grounds si spostano
        for (var i = 0; i < this.grounds.length; i++) {
            this.grounds[i].x -= backgroundSpeed;
        }
    
        //se escono completamente dal canvas vengono ridisegnati in fondo
        for (var i = 0; i < this.grounds.length; i++) {
            if (this.grounds[i].x < -2000) {
                this.grounds[i].x = 1100;
            }
        }
    }

    updateMountains() {
        //mountains si spostano
        for (var i = 0; i < this.mountains.length; i++) {
            this.mountains[i].x -= 1;
        }
    
        //se escono completamente dal canvas vengono ridisegnati infondo
        for (var i = 0; i < this.mountains.length; i++) {
            if (this.mountains[i].x < -2000) {
                this.mountains[i].x = 2000;
            }
        }
    }    

    updateScore() {
        // TODO work with lanes, it is not necessary to create all those cacti, just one line repeated multiple times
    
        // for (var i = 0; i < dini.length; i++) {
        //     for (var j = 0; j < cactus[i].length; j++) {
        //         if (dini[i].x > cactus[i][j].x + TRANSLATION && !cactusValidation[i][j]) {
        //             dini[i].score++;
        //             cactusValidation[i][j] = true;
        //             updateDifficulty();
        //         }
        //     }
        // }
    }    

}

const game = new Phaser.Game( initConfig() )