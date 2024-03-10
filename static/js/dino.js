
class Dino {
    constructor(game, playerId, playerNumber) {
        this.game = game;
        this.id = playerId;
        this.playerNumber = playerNumber
        this.dino = null    // dino sprite
        this.dinoColor = null
        this.nickname = ""
        this.score = 0
        this.x = 0
        this.y = 0
        this.sessionPlayerReference = db.ref(`session/${localStorage.getItem("sessionId")}/players/${this.id}`)
        this.is_jumping = false
        this.initialize()

    }

    /** using explicit binding because "this" is not fully initialized and leads to errors when used in class methods while the class in not fully initialized */
    initialize = () => {

        // use _loadPlayerData with promises
        this._initCoordinates()
        this._loadPlayerData().then(() => {
            // Now you can safely call functions that depend on data from _loadPlayerData
            this._createPlayerName()
            this._createSprite()    //must go after collider line
        });
        this._createColliderLine()
        this._createJumpListener()
    }


    _initCoordinates() {
        this._initX()
        this._initY()
        console.log(`${this.id}: initialized coordinates: (${this.x}, ${this.y})`)
    }
    _initX() {
        this.x = START_DISTANCE_DINI + (this.playerNumber * TRANSLATION)
    }

    _initY() {
        this.y = START_HEIGHT + (this.playerNumber * HEIGHT_SPACE)
    }

    /** using arrow function to ensure that "this" is the same as the class "this" */
    _loadPlayerData() {
        return new Promise((resolve, reject) => {
            if (this.id.startsWith("guest_")) {
                this.sessionPlayerReference.once("value", (userData) => {
                    this.dinoColor = userData.val().dino_color;
                    this.nickname = this.id;
                    console.log(`${this.id}: loaded player data [${this.nickname}, ${this.dinoColor}]`);
                    resolve();
                });
            } else if (this.id.length === 28) {
                db.ref(`user/${this.id}`).once("value", (userData) => {
                    this.nickname = userData.val().nickname;
                    this.dinoColor = userData.val().dino_color;
                    console.log(`${this.id}: loaded player data [${this.nickname}, ${this.dinoColor}]`);
                    resolve();
                });
            }
        });
    }

    _createSprite() {
        this.dino = this.game.physics.add.sprite(this.x, this.y, 'dinoSprite').setOrigin(0, 0);
        this.dino.setTintFill(this.dinoColor, this.dinoColor, this.dinoColor, this.dinoColor);
        this.dino.setCollideWorldBounds(true); //collisioni del dino con i bordi
        this.game.physics.add.collider(this.dino, this.line);
        this.dino.play("run");
        console.log(`${this.id}: loaded dino sprite data`)
    }

    _createPlayerName() {
        this.playerName = this.game.add.text(this.x - 200, this.y - 20, this.nickname, { fontFamily: 'Arial', fontSize: 20, color: '#000' });
        console.log(`${this.id}: created player name "${this.nickname}"`)
    }

    _createJumpListener() {
        this.sessionPlayerReference.on("child_changed", function (playerData) {
            var player_jump = playerData.val();
            if (player_jump && (playerData.ref_.path.pieces_)[3] == "is_jumping") {
                this.is_jumping = true
            }
        });
    }

    _createColliderLine() {
        this.line = this.game.add.zone(this.x, this.y + 5, 100, 1)
        colliderLines.add(this.line)
        this.lineCollider = this.game.physics.add.collider(this.dino, this.line);
        console.log(`${this.id}: created collider line at (${this.line.x}, ${this.line.y})`)
    }

    _updateGroundCollision() {
        this.sessionPlayerReference.update({ 'is_touchingDown': this.dino.body.touching.down })
    }

    assignMedal(medal) {
        if (!this.id.startsWith('guest_')) {
            //can save medal only for non-guest user
            db.ref(`user/${this.id}/medals`).push({ medal })
        }
    }

    saveScore() {
        if (!this.id.startsWith('guest_')) {
            //can save score only for non-guest user
            // db.ref(`user/${this.id}/medals`).push({medal})            
            db.ref(`user/${this.id}`).once("value", function (userData) {
                var savedScore = userData.val().best_score;
                if (score > savedScore) {
                    db.ref(`user/${this.id}`).update({
                        'best_score': score,
                    });
                }
            });
        }
    }

    /**
     * if the Dino is jumping (this.jumping = true)
     * play the animation and then reset the variable (local and in db)
     */
    doJump() {
        this.dino.play('jump')
        this.dino.setVelocityY(-950);
        this.dino.play("run");
        this.is_jumping = false
        this.sessionPlayerReference.update({ 'is_jumping': this.is_jumping });
    }


    die() {
        // TODO implement death, include instructions present in collideCactus
        this.dino.setVelocityX(-100)
        this.dino.play("death")
        this.game.physics.world.removeCollider(this.lineCollider)
    }

    update() {
        // TODO update player dino sprite
        this._updateGroundCollision()
        this.doJump()
        this.playerName.y = this.dino.y
    }
}

